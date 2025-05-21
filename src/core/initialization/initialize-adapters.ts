/**
 * Adapter Initialization
 * 
 * This file handles the initialization of adapters using the adapter registry.
 * It creates and configures the appropriate adapters based on the configuration.
 */

import { createAdapterFactory, validateAdapterConfig } from '@/core/config/adapter-config';
import { DefaultAuthService } from '@/services/auth/default-auth-service';
import { DefaultUserService } from '@/services/user/default-user-service';
import { DefaultTeamService } from '@/services/team/default-team-service';
import { DefaultPermissionService } from '@/services/permission/default-permission-service';
import { UserManagementConfiguration } from '@/core/config';
import { isServer } from '../platform';

/**
 * Initialize adapters and services using the adapter registry
 * 
 * @param adapterConfig Configuration for the adapters
 * @returns Object containing initialized services
 */
/**
 * Interface for adapter initialization options
 */
export interface AdapterInitializationOptions {
  /**
   * Whether the code is running in a server environment
   * @default typeof window === 'undefined'
   */
  isServer?: boolean;
  
  /**
   * Server-side request context (cookies, headers, etc.)
   */
  context?: Record<string, any>;
  
  /**
   * Additional adapter-specific options
   */
  [key: string]: any;
}

export function initializeAdapters(
  adapterConfig: Record<string, any> = {},
  options: AdapterInitializationOptions = {}
) {
  try {
    // Determine if we're in a server environment
    const isServerEnv = options.isServer ?? isServer;
    
    // Merge with default config
    const config = {
      type: 'supabase',
      options: {
        supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL || '',
        supabaseKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '',
        isServer: isServerEnv,
        context: options.context || {},
        ...adapterConfig.options
      },
      ...adapterConfig
    };

    // Validate the adapter configuration
    validateAdapterConfig(config);
    
    // Create the adapter factory
    const factory = createAdapterFactory(config);
    
    // Create adapter instances
    const authAdapter = factory.createAuthProvider();
    const userAdapter = factory.createUserProvider();
    const teamAdapter = factory.createTeamProvider();
    const permissionAdapter = factory.createPermissionProvider();
    
    // Create service instances with the adapters
    const authService = new DefaultAuthService(authAdapter);
    const userService = new DefaultUserService(userAdapter);
    const teamService = new DefaultTeamService(teamAdapter);
    const permissionService = new DefaultPermissionService(permissionAdapter);
    
    return {
      authService,
      userService,
      teamService,
      permissionService,
      adapters: {
        authAdapter,
        userAdapter,
        teamAdapter,
        permissionAdapter
      }
    };
  } catch (error) {
    console.error('Failed to initialize adapters:', error);
    throw error;
  }
}

/**
 * Initialize the User Management Module with adapters
 * 
 * @param config Configuration for the adapters
 * @param options Additional options for the User Management Module
 */
export function initializeUserManagement(config = {}, options = {}) {
  // Initialize adapters and services
  const services = initializeAdapters(config);
  
  // Configure the User Management Module
  UserManagementConfiguration.configure({
    serviceProviders: {
      authService: services.authService,
      userService: services.userService,
      teamService: services.teamService,
      permissionService: services.permissionService,
      ...options.serviceProviders
    },
    options: {
      // Default options
      redirects: {
        afterLogin: '/dashboard',
        afterLogout: '/',
        afterRegistration: '/dashboard',
        afterPasswordReset: '/login',
      },
      // Merge with provided options
      ...options
    }
  });
  
  return services;
}

export default initializeUserManagement;
