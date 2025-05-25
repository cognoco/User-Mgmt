/**
 * Application Initialization
 *
 * This file initializes the application by configuring all necessary services
 * and adapters according to the architecture guidelines.
 */

import { UserManagementConfiguration } from "@/core/config";
import { createSupabaseClient } from "@/lib/database/supabase";
import { api } from "@/lib/api/axios";

// Import factory functions
import { createAuthService } from "@/services/auth";
import { createUserService } from "@/services/user";
// Import API-based team service for client use
import { getApiTeamService } from "@/services/team/api-team.service"; // client-safe
// Do NOT import Prisma-based createTeamService at the top level!
import { createPermissionService } from "@/services/permission";
import { createWebhookService } from "@/services/webhooks";

// Import adapter factories
import { createSupabaseAuthProvider } from "@/adapters/auth";
import { createSupabaseUserProvider } from "@/adapters/user";
import { createSupabaseTeamProvider } from "@/adapters/team";
import { createSupabasePermissionProvider } from "@/adapters/permission";
import { createSupabaseWebhookProvider } from "@/adapters/webhooks";

// Initialize the application
export function initializeApp() {
  // DEBUG: Log environment variable values for troubleshooting
  console.log("ENV CHECK", {
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  });
  try {
    console.log("Initializing application...");

    // Get environment variables
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";
    
    if (!supabaseUrl || !supabaseKey) {
      throw new Error("Missing Supabase environment variables");
    }

    // Create data providers (adapters)
    const authProvider = createSupabaseAuthProvider({
      supabaseUrl,
      supabaseKey
    });
    
    const userProvider = createSupabaseUserProvider({
      supabaseUrl,
      supabaseKey
    });
    
    const teamProvider = createSupabaseTeamProvider({
      supabaseUrl,
      supabaseKey
    });
    
    const permissionProvider = createSupabasePermissionProvider({
      supabaseUrl,
      supabaseKey
    });
    
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
      apiClient: api,
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
      registration: true,
      emailVerification: true,
      passwordReset: true,
      profileManagement: true,
      teamManagement: true,
      roleBasedAccess: true,
      multiFactorAuth: false, // Disabled as noted in GAP_ANALYSIS.md
      accountLinking: false   // Disabled as noted in GAP_ANALYSIS.md
    });

    // Configure options
    UserManagementConfiguration.configure({
      options: {
        redirects: {
          afterLogin: '/dashboard',
          afterLogout: '/',
          afterRegistration: '/auth/verify-email',
          afterPasswordReset: '/auth/login'
        }
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
