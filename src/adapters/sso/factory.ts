/**
 * SSO Provider Factory
 *
 * Provides factory functions for creating SSO data providers.
 */

import { SsoDataProvider } from './interfaces';
import { SupabaseSsoProvider } from './supabase-adapter';

export function createSupabaseSsoProvider(
  supabaseUrl: string,
  supabaseKey: string
): SsoDataProvider {
  return new SupabaseSsoProvider(supabaseUrl, supabaseKey);
}

export function createSsoProvider(config: {
  type: 'supabase' | string;
  options: Record<string, any>;
}): SsoDataProvider {
  switch (config.type) {
    case 'supabase':
      return createSupabaseSsoProvider(
        config.options.supabaseUrl,
        config.options.supabaseKey
      );
    default:
      throw new Error(`Unsupported SSO provider type: ${config.type}`);
  }
}
