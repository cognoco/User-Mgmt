/**
 * Core configuration interfaces for the User Management Module
 * This file defines the configuration interfaces that govern the module's behavior
 */

/**
 * Feature flags for enabling/disabling specific functionality
 */
export interface FeatureFlags {
  // Authentication features
  enableRegistration: boolean;
  enablePasswordReset: boolean;
  enableMFA: boolean;
  enableSocialAuth: boolean;
  enableSSOAuth: boolean;
  
  // User management features
  enableProfileManagement: boolean;
  enableAccountSettings: boolean;
  
  // Team management features
  enableTeams: boolean;
  enableTeamInvitations: boolean;
  enableTeamRoles: boolean;
  
  // Permission features
  enableRoleManagement: boolean;
  enablePermissionManagement: boolean;
  
  // Notification features
  enableEmailNotifications: boolean;
  enableInAppNotifications: boolean;
}

/**
 * Default feature flags configuration
 */
export const DEFAULT_FEATURE_FLAGS: FeatureFlags = {
  // Authentication features - enabled by default
  enableRegistration: true,
  enablePasswordReset: true,
  enableMFA: true,
  enableSocialAuth: true,
  enableSSOAuth: true,
  
  // User management features - enabled by default
  enableProfileManagement: true,
  enableAccountSettings: true,
  
  // Team management features - enabled by default
  enableTeams: true,
  enableTeamInvitations: true,
  enableTeamRoles: true,
  
  // Permission features - enabled by default
  enableRoleManagement: true,
  enablePermissionManagement: true,
  
  // Notification features - enabled by default
  enableEmailNotifications: true,
  enableInAppNotifications: true,
};

/**
 * Service provider registry interface
 * This allows host applications to override default service implementations
 */
export interface ServiceProviderRegistry {
  // Core services
  authService?: any; // Will be typed as AuthService
  userService?: any; // Will be typed as UserService
  teamService?: any; // Will be typed as TeamService
  permissionService?: any; // Will be typed as PermissionService
  webhookService?: any; // Will be typed as WebhookService
  
  // Additional services
  notificationService?: any; // Will be typed as NotificationService
  csrfService?: any; // Will be typed as CsrfService
  
  // Allow for additional services to be registered
  [key: string]: any;
}

/**
 * Main configuration interface for the User Management Module
 */
export interface UserManagementConfig {
  /**
   * Feature flags to enable/disable specific functionality
   */
  featureFlags: FeatureFlags;
  
  /**
   * Service provider registry for overriding default implementations
   */
  serviceProviders: ServiceProviderRegistry;
  
  /**
   * Additional configuration options
   */
  options: {
    /**
     * Base URL for the application, used for generating links in emails, etc.
     */
    baseUrl: string;
    
    /**
     * Default redirect paths
     */
    redirects: {
      afterLogin: string;
      afterLogout: string;
      afterRegistration: string;
      afterPasswordReset: string;
    };
  };
}

/**
 * Default configuration
 */
export const DEFAULT_CONFIG: UserManagementConfig = {
  featureFlags: DEFAULT_FEATURE_FLAGS,
  serviceProviders: {},
  options: {
    baseUrl: typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000',
    redirects: {
      afterLogin: '/dashboard/overview',
      afterLogout: '/',
      afterRegistration: '/onboarding',
      afterPasswordReset: '/auth/login',
    },
  },
};
