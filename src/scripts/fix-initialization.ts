/**
 * Fix Initialization Script
 * 
 * This script is designed to diagnose and fix issues with the application initialization.
 * It checks for missing or improperly registered services and ensures they are properly
 * registered with the UserManagementConfiguration.
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

// Function to check if a service is registered
function checkServiceRegistration(serviceName: string): boolean {
  const service = UserManagementConfiguration.getServiceProvider(serviceName);
  return !!service;
}

// Function to register all services
function registerAllServices() {
  try {
    console.log("Registering all services...");

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
      enableRegistration: true,
      enablePasswordReset: true,
      enableMFA: true,
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
        redirects: {
          afterLogin: '/dashboard',
          afterLogout: '/',
          afterRegistration: '/auth/verify-email',
          afterPasswordReset: '/auth/login'
        }
      }
    });

    console.log("All services registered successfully");
    return {
      authService,
      userService,
      teamService,
      permissionService,
      webhookService
    };
  } catch (error) {
    console.error("Failed to register services:", error);
    throw error;
  }
}

// Function to diagnose initialization issues
function diagnoseInitializationIssues() {
  console.log("Diagnosing initialization issues...");
  
  const services = [
    "authService",
    "userService",
    "teamService",
    "permissionService",
    "webhookService"
  ];
  
  const missingServices = services.filter(service => !checkServiceRegistration(service));
  
  if (missingServices.length > 0) {
    console.log(`Missing services: ${missingServices.join(", ")}`);
    console.log("Attempting to register missing services...");
    registerAllServices();
    
    // Check again after registration
    const stillMissingServices = services.filter(service => !checkServiceRegistration(service));
    
    if (stillMissingServices.length > 0) {
      console.error(`Failed to register services: ${stillMissingServices.join(", ")}`);
      return false;
    } else {
      console.log("All services successfully registered");
      return true;
    }
  } else {
    console.log("All services are properly registered");
    return true;
  }
}

// Export the functions for use in other files
export {
  checkServiceRegistration,
  registerAllServices,
  diagnoseInitializationIssues
};

// If this script is run directly, diagnose and fix issues
if (typeof window !== 'undefined') {
  console.log("Running initialization diagnostics...");
  diagnoseInitializationIssues();
}
