/**
 * Core Configuration Interfaces
 * 
 * This file defines the interfaces for configuring the User Management Module.
 * These interfaces allow host applications to override service implementations
 * while maintaining type safety and architectural compliance.
 */

import type { AuthService } from '@/core/auth/interfaces';
import type { UserService } from '@/core/user/interfaces';
import type { PermissionService } from '@/core/permission/interfaces';
import type { TeamService } from '@/core/team/interfaces';

/**
 * Service container interface that holds all available services
 */
export interface ServiceContainer {
  auth: AuthService;
  user: UserService;
  team: TeamService;
  permission?: PermissionService;
  // Add other services as needed
}

/**
 * Configuration for individual service instances
 */
export interface ServiceConfig {
  /**
   * Custom auth service implementation
   */
  authService?: AuthService;
  
  /**
   * Custom user service implementation  
   */
  userService?: UserService;

  /**
   * Custom permission service implementation
   */
  permissionService?: PermissionService;

  /**
   * Custom team service implementation
   */
  teamService?: TeamService;
  
  /**
   * Feature flags to enable/disable functionality
   */
  featureFlags?: FeatureFlags;
  
  /**
   * API-specific configuration
   */
  apiConfig?: ApiConfiguration;
}

/**
 * Feature flags for enabling/disabling functionality
 */
export interface FeatureFlags {
  mfa?: boolean;
  oauth?: boolean;
  permissions?: boolean;
  audit?: boolean;
  webhooks?: boolean;
  [key: string]: boolean | undefined;
}

/**
 * API-specific configuration options
 */
export interface ApiConfiguration {
  /**
   * Whether to require authentication by default for API routes
   */
  requireAuthByDefault?: boolean;
  
  /**
   * Default permissions required for API access
   */
  defaultPermissions?: string[];
  
  /**
   * Rate limiting configuration
   */
  rateLimiting?: {
    windowMs: number;
    max: number;
  };
  
  /**
   * CORS configuration
   */
  cors?: {
    origin: string | string[];
    credentials: boolean;
  };
}

/**
 * Module configuration interface for host applications
 */
export interface UserManagementConfig {
  /**
   * Service implementations
   */
  services?: ServiceConfig;
  
  /**
   * Feature flags
   */
  features?: FeatureFlags;
  
  /**
   * API configuration
   */
  api?: ApiConfiguration;
}

/**
 * Authentication context passed to API handlers
 */
export interface AuthContext {
  /**
   * Current user ID (if authenticated)
   */
  userId?: string;
  
  /**
   * Current user object (if includeUser option is enabled)
   */
  user?: any;
  
  /**
   * User permissions (if includePermissions option is enabled)
   */
  permissions?: string[];
  
  /**
   * Whether the request is authenticated
   */
  isAuthenticated: boolean;
  
  /**
   * Authentication token
   */
  token?: string;
}

/**
 * Options for API handler creation
 */
export interface ApiHandlerOptions {
  /**
   * Whether authentication is required for this endpoint
   */
  requireAuth?: boolean;
  
  /**
   * Specific permissions required to access this endpoint
   */
  requiredPermissions?: string[];
  
  /**
   * Whether to include full user object in auth context
   */
  includeUser?: boolean;
  
  /**
   * Whether to include user permissions in auth context
   */
  includePermissions?: boolean;
  
  /**
   * Custom service implementations for this handler
   */
  services?: Partial<ServiceContainer>;
  
  /**
   * Rate limiting override for this endpoint
   */
  rateLimit?: {
    windowMs: number;
    max: number;
  };
}

/**
 * Core configuration interfaces for the User Management Module
 * This file defines the configuration interfaces that govern the module's behavior
 */

/**
 * API-related configuration
 */
export interface ApiOptions {
  /** Base URL for backend API calls */
  baseUrl: string;
  /** Request timeout in milliseconds */
  timeoutMs: number;
}

/** UI customisation options */
export interface UiOptions {
  /** Theme preference */
  theme: 'light' | 'dark';
  /** Primary brand colour */
  primaryColor: string;
}

/** Security-related configuration */
export interface SecurityOptions {
  /** Header name for CSRF tokens */
  csrfHeaderName: string;
  /** Allowed origins for CORS */
  allowedOrigins: string[];
}

export interface UserManagementOptions {
  /** Base URL for the application, used for generating links in emails, etc. */
  baseUrl: string;
  /** Default redirect paths */
  redirects: {
    afterLogin: string;
    afterLogout: string;
    afterRegistration: string;
    afterPasswordReset: string;
  };
  /** API configuration */
  api: ApiOptions;
  /** UI customisation */
  ui: UiOptions;
  /** Security settings */
  security: SecurityOptions;
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
  options: UserManagementOptions;
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
    api: {
      baseUrl: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api',
      timeoutMs: parseInt(process.env.API_TIMEOUT_MS || '10000', 10),
    },
    ui: {
      theme: (process.env.UI_THEME as 'light' | 'dark') || 'light',
      primaryColor: process.env.UI_PRIMARY_COLOR || '#6366f1',
    },
    security: {
      csrfHeaderName: process.env.CSRF_HEADER_NAME || 'x-csrf-token',
      allowedOrigins: (process.env.CORS_ALLOWED_ORIGINS || '').split(',').filter(Boolean),
    },
  },
};
