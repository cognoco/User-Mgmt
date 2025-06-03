/**
 * Service Container
 * 
 * This file provides a centralized service container that manages service instances
 * and allows host applications to override service implementations while maintaining
 * type safety and providing sensible defaults.
 */

import type { 
  ServiceContainer, 
  ServiceConfig, 
  UserManagementConfig 
} from '@/core/config/interfaces';
import type { AuthService } from '@/core/auth/interfaces';
import type { UserService } from '@/core/user/interfaces';
import type { PermissionService } from '@/core/permission/interfaces';

// Import existing service factories
import { getApiAuthService } from '@/services/auth/factory';
import { getApiUserService } from '@/services/user/factory';

/**
 * Global service configuration
 */
let globalServiceConfig: ServiceConfig = {};

/**
 * Cached service instances
 */
let serviceInstances: Partial<ServiceContainer> = {};

/**
 * Configure services globally for the entire application
 * This allows host applications to override service implementations
 */
export function configureServices(config: ServiceConfig): void {
  globalServiceConfig = { ...globalServiceConfig, ...config };
  
  // Clear cached instances so they get recreated with new config
  serviceInstances = {};
}

/**
 * Configure the entire User Management module
 * This is the main entry point for host applications
 */
export function configureUserManagement(config: UserManagementConfig): void {
  if (config.services) {
    configureServices(config.services);
  }
  
  // TODO: Handle feature flags and API configuration
  // This will be expanded in future steps
}

/**
 * Get a configured service container with all services
 * Uses global configuration and caches instances for performance
 */
export function getServiceContainer(overrides?: Partial<ServiceContainer>): ServiceContainer {
  // Create auth service if not cached
  if (!serviceInstances.auth) {
    serviceInstances.auth = globalServiceConfig.authService || getApiAuthService();
  }
  
  // Create user service if not cached
  if (!serviceInstances.user) {
    serviceInstances.user = globalServiceConfig.userService || getApiUserService();
  }
  
  // Create permission service if not cached (optional)
  if (!serviceInstances.permission && globalServiceConfig.permissionService) {
    serviceInstances.permission = globalServiceConfig.permissionService;
  }
  
  // Return container with any provided overrides
  return {
    auth: overrides?.auth || serviceInstances.auth!,
    user: overrides?.user || serviceInstances.user!,
    permission: overrides?.permission || serviceInstances.permission,
  };
}

/**
 * Get a specific service with fallback to global configuration
 */
export function getConfiguredAuthService(override?: AuthService): AuthService {
  return override || globalServiceConfig.authService || getApiAuthService();
}

/**
 * Get a specific service with fallback to global configuration
 */
export function getConfiguredUserService(override?: UserService): UserService {
  return override || globalServiceConfig.userService || getApiUserService();
}

/**
 * Get a specific service with fallback to global configuration
 */
export function getConfiguredPermissionService(override?: PermissionService): PermissionService | undefined {
  return override || globalServiceConfig.permissionService;
}

/**
 * Reset all cached service instances
 * Useful for testing or when configuration changes
 */
export function resetServiceContainer(): void {
  serviceInstances = {};
  globalServiceConfig = {};
}

/**
 * Get current service configuration (read-only)
 */
export function getServiceConfiguration(): Readonly<ServiceConfig> {
  return { ...globalServiceConfig };
} 