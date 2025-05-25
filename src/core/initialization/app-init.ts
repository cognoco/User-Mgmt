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
import { getAuthService } from "@/services/auth";
import { getUserService } from "@/services/user";
import { getTeamService } from "@/services/team";
import { getPermissionService } from "@/services/permission";
import { createWebhookService } from "@/services/webhooks";

// Import adapter factories
import { createSupabaseAuthProvider } from "@/adapters/auth";
import { createSupabaseUserProvider } from "@/adapters/user";
import { createSupabaseTeamProvider } from "@/adapters/team";
import { createSupabasePermissionProvider } from "@/adapters/permission";
import { createSupabaseWebhookProvider } from "@/adapters/webhooks";

// Initialize the application
export function initializeApp() {
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
    const authService = getAuthService(authProvider);
    const userService = getUserService(userProvider);
    const teamService = getTeamService(teamProvider);
    const permissionService = getPermissionService(permissionProvider);
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
