/**
 * Supabase Adapter Factory
 * 
 * This file implements the AdapterFactory interface for Supabase adapters.
 * It provides methods to create Supabase adapter instances for different data providers.
 */


import { AdapterFactory, AdapterFactoryOptions } from '@/src/adapters/registry'216;
import { AuthDataProvider } from '@/src/adapters/auth/interfaces'285;
import { IUserDataProvider as UserDataProvider } from '@/core/user/IUserDataProvider';
import { ITeamDataProvider as TeamDataProvider } from '@/core/team/ITeamDataProvider';
import { IPermissionDataProvider as PermissionDataProvider } from '@/core/permission/IPermissionDataProvider';
import { IGdprDataProvider as GdprDataProvider } from '@/core/gdpr/IGdprDataProvider';
import { IConsentDataProvider } from '@/core/consent/IConsentDataProvider';
import { ISessionDataProvider as SessionDataProvider } from '@/core/session/ISessionDataProvider';
import { ISsoDataProvider as SsoDataProvider } from '@/core/sso/ISsoDataProvider';
import { ISubscriptionDataProvider as SubscriptionDataProvider } from '@/core/subscription/ISubscriptionDataProvider';
import { IApiKeyDataProvider as ApiKeyDataProvider } from '@/core/apiKeys/IApiKeyDataProvider'1097;
import { IWebhookDataProvider } from '@/core/webhooks/IWebhookDataProvider';
import { IOrganizationDataProvider } from '@/core/organization/IOrganizationDataProvider';
import { IAdminDataProvider } from '@/core/admin/IAdminDataProvider';
import type { ITwoFactorDataProvider } from '@/core/twoFactor/ITwoFactorDataProvider'1436;
import { ISavedSearchDataProvider } from '@/core/savedSearch/ISavedSearchDataProvider'1525;


// Import domain-specific factories
import { createSupabaseAuthProvider } from '@/src/adapters/auth/factory'1656;
import { createSupabaseUserProvider } from '@/src/adapters/user/factory'1718;
import { createSupabaseTeamProvider } from '@/src/adapters/team/factory'1780;
import { createSupabaseOrganizationProvider } from '@/src/adapters/organization/factory'1842;
import { createSupabasePermissionProvider } from '@/src/adapters/permission/factory'1920;
import { createSupabaseGdprProvider } from '@/src/adapters/gdpr/factory'1994;
import { createSupabaseConsentProvider } from '@/src/adapters/consent/factory'2056;
import { createSupabaseSessionProvider } from '@/src/adapters/session/factory'2124;
import { createSupabaseSsoProvider } from '@/src/adapters/sso/factory'2192;
import { createSupabaseOAuthProvider } from '@/src/adapters/oauth/factory'2252;
import type { OAuthDataProvider } from '@/src/adapters/oauth'2316;
import { createSupabaseSubscriptionProvider } from '@/src/adapters/subscription/factory'2367;
import { createSupabaseCompanyNotificationProvider } from '@/src/adapters/companyNotification/factory'2445;
import { createSupabaseWebhookProvider } from '@/src/adapters/webhooks'2538;
import { createSupabaseAdminProvider } from '@/src/adapters/admin/factory'2599;
import { createSupabaseTwoFactorProvider } from '@/src/adapters/twoFactor/factory'2663;
import { createSupabaseSavedSearchProvider } from '@/src/adapters/savedSearch/factory'2736;
import { createSupabaseDataExportProvider } from '@/src/adapters/dataExport/factory'2813;
import type { IDataExportDataProvider } from '@/core/dataExport/IDataExportDataProvider'2888;
import { createSupabaseApiKeyProvider } from '@/src/adapters/apiKeys/factory'2980;
import type { ICompanyNotificationDataProvider } from '@/core/companyNotification/ICompanyNotificationDataProvider'3048;



/**
 * Factory for creating Supabase adapters
 */
export class SupabaseAdapterFactory implements AdapterFactory {
  private options: {
    supabaseUrl: string;
    supabaseKey: string;
    isServer?: boolean;
    context?: Record<string, any>;
    [key: string]: any;
  };

  constructor(options: AdapterFactoryOptions) {
    this.options = {
      supabaseUrl: options.supabaseUrl as string,
      supabaseKey: options.supabaseKey as string,
      isServer: options.isServer as boolean | undefined,
      context: options.context as Record<string, any> | undefined,
      ...options
    };

    if (!this.options.supabaseUrl || !this.options.supabaseKey) {
      throw new Error('Supabase URL and Key are required for SupabaseAdapterFactory');
    }
  }

  /**
   * Create a Supabase auth provider
   */
  createAuthProvider(): AuthDataProvider {
    return createSupabaseAuthProvider(
      this.options.supabaseUrl,
      this.options.supabaseKey
    );
  }

  /**
   * Create a Supabase user provider
   */
  createUserProvider(): UserDataProvider {
    return createSupabaseUserProvider(this.options);
  }

  /**
   * Create a Supabase admin provider
   */
  createAdminProvider(): IAdminDataProvider {
    return createSupabaseAdminProvider(this.options);
  }

  /**
   * Create a Supabase team provider
   */
  createTeamProvider(): TeamDataProvider {
    return createSupabaseTeamProvider(this.options);
  }

  /**
   * Create a Supabase organization provider
   */
  createOrganizationProvider(): IOrganizationDataProvider {
    return createSupabaseOrganizationProvider(this.options);
  }

  /**
   * Create a Supabase permission provider
   */
  createPermissionProvider(): PermissionDataProvider {
    return createSupabasePermissionProvider(this.options);
  }

  /**
  /**
   * Create a Supabase GDPR provider
   */
  createGdprProvider(): GdprDataProvider {
    return createSupabaseGdprProvider(this.options);
  }

  /**
   * Create a Supabase consent provider
   */
  createConsentProvider(): IConsentDataProvider {
    return createSupabaseConsentProvider(this.options);
  }

  /**
   * Create a Supabase session provider
   */
  createSessionProvider(): SessionDataProvider {
    return createSupabaseSessionProvider(this.options);
  }

  /**
   * Create a Supabase two-factor provider
   */
  createTwoFactorProvider(): ITwoFactorDataProvider {
    return createSupabaseTwoFactorProvider(this.options);
  }

  /**
   * Create a Supabase SSO provider
   */
  createSsoProvider(): SsoDataProvider {
    return createSupabaseSsoProvider(this.options);
  }

  /**
   * Create a Supabase OAuth provider
   */
  createOAuthProvider(): OAuthDataProvider {
    return createSupabaseOAuthProvider(this.options);
  }

  /**
   * Create a Supabase subscription provider
   */
  createSubscriptionProvider(): SubscriptionDataProvider {
    return createSupabaseSubscriptionProvider(this.options);
  }
  /**
   * Create a Supabase API key provider
   */
  createApiKeyProvider(): ApiKeyDataProvider {
    return createSupabaseApiKeyProvider(this.options);
  }

  /**
/**
 * Create a Supabase company notification provider
 */
createCompanyNotificationProvider(): ICompanyNotificationDataProvider {
  return createSupabaseCompanyNotificationProvider(this.options);
}

/**
 * Create a Supabase saved search provider
 */
createSavedSearchProvider(): ISavedSearchDataProvider {
  return createSupabaseSavedSearchProvider(this.options);
}

/**
 * Create a Supabase data export provider
 */
createDataExportProvider(): IDataExportDataProvider {
  return createSupabaseDataExportProvider(this.options);
}

  /**
   * Create a Supabase webhook provider
   */
  createWebhookProvider(): IWebhookDataProvider {
    return createSupabaseWebhookProvider(this.options);
  }
}

/**
 * Factory creator function for Supabase adapters
 * 
 * @param options Configuration options including supabaseUrl and supabaseKey
 * @returns A new SupabaseAdapterFactory instance
 */
export function createSupabaseAdapterFactory(options: AdapterFactoryOptions): AdapterFactory {
  return new SupabaseAdapterFactory(options);
}

/**
 * Default export for the Supabase adapter factory creator
 */
export default createSupabaseAdapterFactory;
