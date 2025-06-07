/**
 * Adapter Initialization
 * 
 * This file handles the initialization of adapters using the adapter registry.
 * It creates and configures the appropriate adapters based on the configuration.
 */

import { createAdapterFactory, validateAdapterConfig } from '@/core/config/adapterConfig';
import { DefaultAuthService } from '@/services/auth/defaultAuth.service';
import { BrowserAuthStorage } from '@/services/auth/authStorage';
import { DefaultUserService } from '@/services/user/defaultUser.service';
import { DefaultTeamService } from '@/services/team/defaultTeam.service';
import { DefaultOrganizationService } from '@/services/organization/defaultOrganization.service';
import { DefaultPermissionService } from '@/services/permission/defaultPermission.service';
import { DefaultGdprService } from '@/services/gdpr/defaultGdpr.service';
import { DefaultSsoService } from '@/services/sso/defaultSso.service';
import { DefaultConsentService } from '@/services/consent/defaultConsent.service';
import { DefaultSessionService } from '@/services/session/defaultSession.service';
import { DefaultSubscriptionService } from '@/services/subscription/defaultSubscription.service';
import { DefaultApiKeysService } from '@/services/apiKeys/defaultApiKeys.service';
import { WebhookService } from '@/services/webhooks/WebhookService';
import { DefaultAddressService } from '@/services/address/defaultAddress.service';
import { DefaultNotificationService } from '@/services/notification/defaultNotification.service';
import { DefaultAuditService } from '@/services/audit/defaultAudit.service';
import { DefaultCsrfService } from '@/services/csrf/defaultCsrf.service';
import { DefaultNotificationHandler } from '@/services/notification/defaultNotification.handler';
import { DefaultAdminService } from '@/services/admin/defaultAdmin.service';
import {
  createAddressProvider
} from '@/adapters/address/factory';
import { createAuditProvider } from '@/adapters/audit/factory';
import { createNotificationProvider } from '@/adapters/notification/factory';
import { createCsrfProvider } from '@/adapters/csrf/factory';
import { createResourceRelationshipProvider } from '@/adapters/resourceRelationship/factory';
import { DefaultResourceRelationshipService } from '@/services/resourceRelationship/defaultResourceRelationship.service';
import { UserManagementConfiguration } from '@/core/config';
import { AdapterRegistry } from '@/adapters/registry';
import { isServer } from '@/core/platform';

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
