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
import type { TeamService } from '@/core/team/interfaces';
import type { SsoService } from '@/core/sso/interfaces';
import type { GdprService } from '@/core/gdpr/interfaces';
import type { TwoFactorService } from '@/core/two-factor/interfaces';
import type { SubscriptionService } from '@/core/subscription/interfaces';
import type { ApiKeyService } from '@/core/api-keys/interfaces';
import type { NotificationService } from '@/core/notification/interfaces';

// Import existing service factories
import { getApiAuthService } from '@/services/auth/factory';
import { getApiUserService } from '@/services/user/factory';
import { getApiPermissionService } from '@/services/permission/factory';
import { getApiTeamService } from '@/services/team/factory';
import { getApiSsoService } from '@/services/sso/factory';
import { getApiGdprService } from '@/services/gdpr/factory';
import { getApiTwoFactorService } from '@/services/two-factor/factory';
import { getApiSubscriptionService } from '@/services/subscription/factory';
import { getApiKeyService } from '@/services/api-keys/factory';
import { getApiNotificationService } from '@/services/notification/factory';

// TODO: Import additional service factories as they become available
// import { getApiRoleService } from '@/services/role/factory';
// import { getApiWebhookService } from '@/services/webhooks/factory';

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
  
  // Create permission service if not cached
  if (!serviceInstances.permission && (globalServiceConfig.permissionService || globalServiceConfig.featureFlags?.permissions !== false)) {
    serviceInstances.permission = globalServiceConfig.permissionService || getApiPermissionService();
  }
  
  // Create team service if not cached
  if (!serviceInstances.team && globalServiceConfig.teamService) {
    serviceInstances.team = globalServiceConfig.teamService;
  } else if (!serviceInstances.team && globalServiceConfig.featureFlags?.teams !== false) {
    serviceInstances.team = getApiTeamService();
  }
  
  // Create SSO service if not cached
  if (!serviceInstances.sso && globalServiceConfig.ssoService) {
    serviceInstances.sso = globalServiceConfig.ssoService;
  } else if (!serviceInstances.sso && globalServiceConfig.featureFlags?.sso !== false) {
    serviceInstances.sso = getApiSsoService();
  }
  
  // Create GDPR service if not cached
  if (!serviceInstances.gdpr && globalServiceConfig.gdprService) {
    serviceInstances.gdpr = globalServiceConfig.gdprService;
  } else if (!serviceInstances.gdpr && globalServiceConfig.featureFlags?.gdpr !== false) {
    serviceInstances.gdpr = getApiGdprService();
  }
  
  // Create two-factor service if not cached
  if (!serviceInstances.twoFactor && globalServiceConfig.twoFactorService) {
    serviceInstances.twoFactor = globalServiceConfig.twoFactorService;
  } else if (!serviceInstances.twoFactor && globalServiceConfig.featureFlags?.twoFactor !== false) {
    serviceInstances.twoFactor = getApiTwoFactorService();
  }
  
  // Create subscription service if not cached
  if (!serviceInstances.subscription && globalServiceConfig.subscriptionService) {
    serviceInstances.subscription = globalServiceConfig.subscriptionService;
  } else if (!serviceInstances.subscription && globalServiceConfig.featureFlags?.subscription !== false) {
    serviceInstances.subscription = getApiSubscriptionService();
  }
  
  // Create API key service if not cached
  if (!serviceInstances.apiKey && globalServiceConfig.apiKeyService) {
    serviceInstances.apiKey = globalServiceConfig.apiKeyService;
  } else if (!serviceInstances.apiKey && globalServiceConfig.featureFlags?.apiKeys !== false) {
    serviceInstances.apiKey = getApiKeyService();
  }
  
  // Create notification service if not cached
  if (!serviceInstances.notification && globalServiceConfig.notificationService) {
    serviceInstances.notification = globalServiceConfig.notificationService;
  } else if (!serviceInstances.notification && globalServiceConfig.featureFlags?.notifications !== false) {
    serviceInstances.notification = getApiNotificationService();
  }
  
  // TODO: Add other services as their factories become available
  
  // Return container with any provided overrides
  return {
    auth: overrides?.auth || serviceInstances.auth!,
    user: overrides?.user || serviceInstances.user!,
    permission: overrides?.permission || serviceInstances.permission,
    team: overrides?.team || serviceInstances.team,
    sso: overrides?.sso || serviceInstances.sso,
    gdpr: overrides?.gdpr || serviceInstances.gdpr,
    twoFactor: overrides?.twoFactor || serviceInstances.twoFactor,
    subscription: overrides?.subscription || serviceInstances.subscription,
    apiKey: overrides?.apiKey || serviceInstances.apiKey,
    notification: overrides?.notification || serviceInstances.notification,
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
  return override || globalServiceConfig.permissionService || getApiPermissionService();
}

/**
 * Get a specific service with fallback to global configuration
 */
export function getConfiguredTeamService(override?: TeamService): TeamService | undefined {
  return override || globalServiceConfig.teamService || getApiTeamService();
}

/**
 * Get a specific service with fallback to global configuration
 */
export function getConfiguredSsoService(override?: SsoService): SsoService | undefined {
  return override || globalServiceConfig.ssoService || getApiSsoService();
}

/**
 * Get a specific service with fallback to global configuration
 */
export function getConfiguredGdprService(override?: GdprService): GdprService | undefined {
  return override || globalServiceConfig.gdprService || getApiGdprService();
}

/**
 * Get a specific service with fallback to global configuration
 */
export function getConfiguredTwoFactorService(override?: TwoFactorService): TwoFactorService | undefined {
  return override || globalServiceConfig.twoFactorService || getApiTwoFactorService();
}

/**
 * Get a specific service with fallback to global configuration
 */
export function getConfiguredSubscriptionService(override?: SubscriptionService): SubscriptionService | undefined {
  return override || globalServiceConfig.subscriptionService || getApiSubscriptionService();
}

/**
 * Get a specific service with fallback to global configuration
 */
export function getConfiguredApiKeyService(override?: ApiKeyService): ApiKeyService | undefined {
  return override || globalServiceConfig.apiKeyService || getApiKeyService();
}

/**
 * Get a specific service with fallback to global configuration
 */
export function getConfiguredNotificationService(override?: NotificationService): NotificationService | undefined {
  return override || globalServiceConfig.notificationService || getApiNotificationService();
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