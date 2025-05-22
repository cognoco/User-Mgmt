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
import { ApiKeyDataProvider } from './api-keys/interfaces';

// Import domain-specific factories
import createSupabaseAuthProvider from './auth/supabase/factory';
import createSupabaseUserProvider from './user/supabase/factory';
import createSupabaseTeamProvider from './team/supabase/factory';
import createSupabasePermissionProvider from './permission/supabase/factory';
import createSupabaseApiKeyProvider from './api-keys/supabase/factory';

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
    return createSupabaseAuthProvider(this.options);
  }

  /**
   * Create a Supabase user provider
   */
  createUserProvider(): UserDataProvider {
    return createSupabaseUserProvider(this.options);
  }

  /**
   * Create a Supabase team provider
   */
  createTeamProvider(): TeamDataProvider {
    return createSupabaseTeamProvider(this.options);
  }

  /**
   * Create a Supabase permission provider
   */
  createPermissionProvider(): PermissionDataProvider {
    return createSupabasePermissionProvider(this.options);
  }

  /**
   * Create a Supabase API key provider
   */
  createApiKeyProvider(): ApiKeyDataProvider {
    return createSupabaseApiKeyProvider(this.options);
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
