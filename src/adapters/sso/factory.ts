/**
 * SSO Provider Factory
 *
 * Provides factory functions for creating SSO data providers.
 */

import type { ISsoDataProvider } from '@/core/sso/ISsoDataProvider';
import { SupabaseSsoProvider } from '@/adapters/sso/supabase/supabaseAdapter';

export function createSupabaseSsoProvider(
  supabaseUrl: string,
  supabaseKey: string
): ISsoDataProvider {
  return new SupabaseSsoProvider(supabaseUrl, supabaseKey);
}

export function createSsoProvider(config: {
  type: 'supabase' | string;
  options: Record<string, any>;
}): ISsoDataProvider {
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
