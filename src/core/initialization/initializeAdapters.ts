/**
 * Adapter Initialization
 * 
 * This file handles the initialization of adapters using the adapter registry.
 * It creates and configures the appropriate adapters based on the configuration.
 */

import { createAdapterFactory, validateAdapterConfig } from '@/core/config/adapterConfig'208;
import { DefaultAuthService } from '@/services/auth/defaultAuth.service'301;
import { BrowserAuthStorage } from '@/services/auth/authStorage'377;
import { DefaultUserService } from '@/services/user/defaultUser.service'445;
import { DefaultTeamService } from '@/services/team/defaultTeam.service'521;
import { DefaultOrganizationService } from '@/services/organization/defaultOrganization.service'597;
import { DefaultPermissionService } from '@/services/permission/defaultPermission.service'697;
import { DefaultGdprService } from '@/services/gdpr/defaultGdpr.service'791;
import { DefaultSsoService } from '@/services/sso/defaultSso.service'867;
import { DefaultConsentService } from '@/services/consent/defaultConsent.service'940;
import { DefaultSessionService } from '@/services/session/defaultSession.service'1025;
import { DefaultSubscriptionService } from '@/services/subscription/defaultSubscription.service'1110;
import { DefaultApiKeysService } from '@/services/apiKeys/defaultApiKeys.service'1210;
import { WebhookService } from '@/services/webhooks/WebhookService';
import { DefaultAddressService } from '@/services/address/defaultAddress.service'1367;
import { DefaultNotificationService } from '@/services/notification/defaultNotification.service'1452;
import { DefaultAuditService } from '@/services/audit/defaultAudit.service'1552;
import { DefaultCsrfService } from '@/services/csrf/defaultCsrf.service'1631;
import { DefaultNotificationHandler } from '@/services/notification/defaultNotification.handler'1707;
import { DefaultAdminService } from '@/services/admin/defaultAdmin.service'1807;
import {
  createAddressProvider
} from '@/adapters/address/factory';
import { createAuditProvider } from '@/adapters/audit/factory';
import { createNotificationProvider } from '@/adapters/notification/factory';
import { createCsrfProvider } from '@/adapters/csrf/factory';
import { createResourceRelationshipProvider } from '@/adapters/resourceRelationship/factory'2166;
import { DefaultResourceRelationshipService } from '@/services/resourceRelationship/defaultResourceRelationship.service'2262;
import { UserManagementConfiguration } from '@/core/config';
import { AdapterRegistry } from '@/adapters/registry';
import { isServer } from '@/src/core/platform'2506;

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
    const organizationAdapter = factory.createOrganizationProvider?.();
    const permissionAdapter = factory.createPermissionProvider();
    const gdprAdapter = factory.createGdprProvider?.();
    const consentAdapter = factory.createConsentProvider?.();
    const sessionAdapter = factory.createSessionProvider();
    const ssoAdapter = factory.createSsoProvider();
    const subscriptionAdapter = factory.createSubscriptionProvider();
    const apiKeyAdapter = factory.createApiKeyProvider();
    const webhookAdapter = factory.createWebhookProvider?.();
    const adminAdapter = factory.createAdminProvider?.();

    const addressAdapter = createAddressProvider(config);
    const auditAdapter = createAuditProvider(config);
    const csrfAdapter = createCsrfProvider(config);
    const notificationAdapter = createNotificationProvider(config);
    const resourceRelationshipAdapter = createResourceRelationshipProvider(config);

    const registry = AdapterRegistry.getInstance();
    registry.registerAdapter('auth', authAdapter);
    registry.registerAdapter('user', userAdapter);
    registry.registerAdapter('team', teamAdapter);
    if (adminAdapter) registry.registerAdapter('admin', adminAdapter);
    if (organizationAdapter) registry.registerAdapter('organization', organizationAdapter);
    registry.registerAdapter('permission', permissionAdapter);
    if (gdprAdapter) registry.registerAdapter('gdpr', gdprAdapter);
    if (consentAdapter) registry.registerAdapter('consent', consentAdapter);
    registry.registerAdapter('session', sessionAdapter);
    registry.registerAdapter('subscription', subscriptionAdapter);
    registry.registerAdapter('apiKey', apiKeyAdapter);
    if (webhookAdapter) registry.registerAdapter('webhook', webhookAdapter);
    registry.registerAdapter('address', addressAdapter);
    registry.registerAdapter('audit', auditAdapter);
    registry.registerAdapter('csrf', csrfAdapter);
    registry.registerAdapter('notification', notificationAdapter);
    registry.registerAdapter('sso', ssoAdapter);
    registry.registerAdapter('resourceRelationship', resourceRelationshipAdapter);
    
    // Create service instances with the adapters
    const storage = new BrowserAuthStorage();
    const authService = new DefaultAuthService(authAdapter, storage);
    const userService = new DefaultUserService(userAdapter);
    const teamService = new DefaultTeamService(teamAdapter);
    const organizationService = organizationAdapter ? new DefaultOrganizationService(organizationAdapter) : undefined;
    const permissionService = new DefaultPermissionService(permissionAdapter);
    const gdprService = gdprAdapter ? new DefaultGdprService(gdprAdapter) : undefined;
    const consentService = consentAdapter ? new DefaultConsentService(consentAdapter) : undefined;
    const sessionService = new DefaultSessionService(sessionAdapter);
    const subscriptionService = new DefaultSubscriptionService(subscriptionAdapter);
    const apiKeyService = new DefaultApiKeysService(apiKeyAdapter);
    const webhookService = webhookAdapter ? new WebhookService(webhookAdapter) : undefined;
    const addressService = new DefaultAddressService(addressAdapter);
    const auditService = new DefaultAuditService(auditAdapter);
    const csrfService = new DefaultCsrfService(csrfAdapter);
    const notificationService = new DefaultNotificationService(notificationAdapter, new DefaultNotificationHandler());
    const ssoService = new DefaultSsoService(ssoAdapter);
    const resourceRelationshipService = new DefaultResourceRelationshipService(resourceRelationshipAdapter);
    const adminService = adminAdapter ? new DefaultAdminService(adminAdapter) : undefined;
    
    return {
      authService,
      userService,
      teamService,
      organizationService,
      permissionService,
      gdprService,
      consentService,
      sessionService,
      subscriptionService,
      apiKeyService,
      webhookService,
      addressService,
      auditService,
      csrfService,
      notificationService,
      resourceRelationshipService,
      ssoService,
      adminService,
      adapters: {
        authAdapter,
        userAdapter,
        teamAdapter,
        organizationAdapter,
        permissionAdapter,
        gdprAdapter,
        consentAdapter,
        sessionAdapter,
        subscriptionAdapter,
        apiKeyAdapter,
        webhookAdapter,
        addressAdapter,
        auditAdapter,
        csrfAdapter,
        notificationAdapter,
        ssoAdapter,
        adminAdapter,
        resourceRelationshipAdapter
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
      gdprService: services.gdprService,
      consentService: services.consentService,
      sessionService: services.sessionService,
      subscriptionService: services.subscriptionService,
      apiKeyService: services.apiKeyService,
      webhookService: services.webhookService,
      addressService: services.addressService,
      auditService: services.auditService,
      csrfService: services.csrfService,
      notificationService: services.notificationService,
      resourceRelationshipService: services.resourceRelationshipService,
      ssoService: services.ssoService,
      adminService: services.adminService,
      ...options.serviceProviders
    },
    options: {
      // Default options
      redirects: {
        afterLogin: '/dashboard/overview',
        afterLogout: '/',
        afterRegistration: '/dashboard/overview',
        afterPasswordReset: '/auth/login',
      },
      // Merge with provided options
      ...options
    }
  });
  
  return services;
}

export default initializeUserManagement;
