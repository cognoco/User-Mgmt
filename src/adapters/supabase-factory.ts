/**
 * Supabase Adapter Factory
 * 
 * This file implements the AdapterFactory interface for Supabase adapters.
 * It provides methods to create Supabase adapter instances for different data providers.
 */


import { AdapterFactory, AdapterFactoryOptions } from './registry';
import { AuthDataProvider } from './auth/interfaces';
import { UserDataProvider } from './user/interfaces';
import { TeamDataProvider } from './team/interfaces';
import { PermissionDataProvider } from './permission/interfaces';
import { GdprDataProvider } from './gdpr/interfaces';
import { IConsentDataProvider } from './consent/IConsentDataProvider';
import { SessionDataProvider } from './session/interfaces';
import { SsoDataProvider } from './sso/interfaces';
import { SubscriptionDataProvider } from './subscription/interfaces';
import { ApiKeyDataProvider } from './api-keys/interfaces';
import { IWebhookDataProvider } from '@/core/webhooks/IWebhookDataProvider';
import { IOrganizationDataProvider } from '@/core/organization/IOrganizationDataProvider';
import { IAdminDataProvider } from '@/core/admin/IAdminDataProvider';
import type { ITwoFactorDataProvider } from '@/core/two-factor/ITwoFactorDataProvider';


// Import domain-specific factories
import { createSupabaseAuthProvider } from './auth/factory';
import createSupabaseUserProvider from './user/supabase/factory';
import createSupabaseTeamProvider from './team/supabase/factory';
import { createSupabaseOrganizationProvider } from './organization/factory';
import createSupabasePermissionProvider from './permission/supabase/factory';
import createSupabaseGdprProvider from './gdpr/factory';
import createSupabaseConsentProvider from './consent/factory';
import { createSupabaseSessionProvider } from './session/factory';
import createSupabaseSsoProvider from './sso/supabase/factory';
import { createSupabaseOAuthProvider } from './oauth/factory';
import type { OAuthDataProvider } from './oauth';
import createSupabaseSubscriptionProvider from './subscription/factory';
import createSupabaseApiKeyProvider from './api-keys/supabase/factory';
import { createSupabaseWebhookProvider } from './webhooks';
import createSupabaseAdminProvider from './admin/supabase/factory';
import createSupabaseTwoFactorProvider from './two-factor/factory';
import { createSupabaseDataExportProvider } from './data-export/factory';
import type { IDataExportDataProvider } from '@/core/data-export/IDataExportDataProvider';


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
