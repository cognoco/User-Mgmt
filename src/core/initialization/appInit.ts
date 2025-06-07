/**
 * Application Initialization
 *
 * This file initializes the application by configuring all necessary services
 * and adapters according to the architecture guidelines.
 */

import { UserManagementConfiguration, getConfiguration } from "@/core/config";
import { api } from "@/lib/api/axios";

// Import factory functions
import { createAuthService } from "@/services/auth";
import { createUserService } from "@/services/user";
// Import API-based team service for client use
import { getApiTeamService } from "@/services/team/apiTeam.service"; // client-safe
// Do NOT import Prisma-based createTeamService at the top level!
import { createPermissionService } from "@/services/permission";
import { createWebhookService } from "@/services/webhooks";


// Import adapter factories
import { createSupabaseAuthProvider } from "@/adapters/auth";
import { createSupabaseUserProvider } from "@/adapters/user";
import { createSupabaseTeamProvider } from "@/adapters/team";
import { createSupabasePermissionProvider } from "@/adapters/permission";
import { createSupabaseWebhookProvider } from "@/adapters/webhooks";
import { AdapterRegistry } from '@/adapters/registry';
import SupabaseCsrfProvider from '@/adapters/csrf/supabase/supabaseCsrf.provider';

// Initialize the application
export function initializeApp() {
  // DEBUG: Log environment variable values for troubleshooting
  console.log("ENV CHECK", {
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  });
  try {
    console.log("Initializing application...");

    const runtimeConfig = getConfiguration();
    if (runtimeConfig.options.api.baseUrl) {
      api.defaults.baseURL = runtimeConfig.options.api.baseUrl;
    }

    // Get environment variables - use same pattern as working supabase client
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    
    console.log("[app-init] Environment variables:", {
      supabaseUrl: supabaseUrl || 'MISSING',
      supabaseKey: supabaseKey ? 'EXISTS' : 'MISSING'
    });
    
    if (!supabaseUrl || !supabaseKey) {
      const missingVars = [];
      if (!supabaseUrl) missingVars.push('NEXT_PUBLIC_SUPABASE_URL');
      if (!supabaseKey) missingVars.push('NEXT_PUBLIC_SUPABASE_ANON_KEY');
      console.error("Missing required environment variables:", missingVars);
      throw new Error(`Missing Supabase environment variables: ${missingVars.join(', ')}`);
    }

    // Register CSRF adapter if not already registered
    const adapterRegistry = AdapterRegistry.getInstance();
    try {
      adapterRegistry.getAdapter('csrf');
    } catch {
      adapterRegistry.registerAdapter('csrf', new SupabaseCsrfProvider(supabaseUrl, supabaseKey));
      console.log('Registered SupabaseCsrfProvider as csrf adapter');
    }

    // Create data providers (adapters)
    const authProvider = createSupabaseAuthProvider(
      supabaseUrl,
      supabaseKey
    );
    
    const userProvider = createSupabaseUserProvider(
      supabaseUrl,
      supabaseKey
    );
    
    const teamProvider = createSupabaseTeamProvider(
      supabaseUrl,
      supabaseKey
    );
    
    const permissionProvider = createSupabasePermissionProvider(
      supabaseUrl,
      supabaseKey
    );
    
    const webhookProvider = createSupabaseWebhookProvider({
      supabaseUrl,
      supabaseKey
    });

    // Create services using the providers
    const authService = createAuthService({ authDataProvider: authProvider });
    const userService = createUserService({ userDataProvider: userProvider });
    // Use API-based team service on client, Prisma-based on server
    let teamService;
    if (typeof window !== "undefined") {
      teamService = getApiTeamService();
    } else {
      // Import here so Prisma code is never bundled to client
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const { createTeamService } = require("@/services/team");
      teamService = createTeamService({ teamDataProvider: teamProvider });
    }
    const permissionService = createPermissionService({
      permissionDataProvider: permissionProvider
    });
    const webhookService = createWebhookService({
      webhookDataProvider: webhookProvider
    });

    // Register all services
    UserManagementConfiguration.configureServiceProviders({
      authService,
      userService,
      teamService,
      permissionService,
      webhookService
    });

    // Configure feature flags
    UserManagementConfiguration.configureFeatures({
      enableRegistration: true,
      enablePasswordReset: true,
      enableMFA: false, // Disabled as noted in GAP_ANALYSIS.md
      enableSocialAuth: true,
      enableSSOAuth: true,
      enableProfileManagement: true,
      enableAccountSettings: true,
      enableTeams: true,
      enableTeamInvitations: true,
      enableTeamRoles: true,
      enableRoleManagement: true,
      enablePermissionManagement: true,
      enableEmailNotifications: true,
      enableInAppNotifications: true
    });

    // Configure options
    UserManagementConfiguration.configure({
      options: {
        redirects: runtimeConfig.options.redirects,
        api: runtimeConfig.options.api,
        ui: runtimeConfig.options.ui,
        security: runtimeConfig.options.security,
        baseUrl: runtimeConfig.options.baseUrl,
      }
    });

    console.log("Application initialized successfully");
    return {
      authService,
      userService,
      teamService,
      permissionService,
      webhookService
    };
  } catch (error) {
    console.error("Failed to initialize application:", error);
    throw error;
  }
}

// Export a default function for easier imports
export default initializeApp;
