/**
 * Auth Data Provider Factory
 * 
 * This file provides factory functions for creating auth data providers.
 * It allows for dependency injection and makes it easy to swap implementations.
 */

import type { AuthDataProvider } from '@/adapters/auth/interfaces';
import { SupabaseAuthProvider } from '@/adapters/auth/providers/supabaseAuthProvider';

/**
 * Create a Supabase auth data provider
 * 
 * @param supabaseUrl Supabase project URL
 * @param supabaseKey Supabase API key
 * @returns Supabase auth data provider instance
 */
export function createSupabaseAuthProvider(
  supabaseUrl: string,
  supabaseKey: string
): AuthDataProvider {
  return new SupabaseAuthProvider(supabaseUrl, supabaseKey);
}

/**
 * Create an auth data provider based on configuration
 * 
 * @param config Configuration object with provider type and options
 * @returns Auth data provider instance
 */
export function createAuthProvider(config: {
  type: 'supabase' | string;
  options: Record<string, any>;
}): AuthDataProvider {
  switch (config.type) {
    case 'supabase':
      return createSupabaseAuthProvider(
        config.options.supabaseUrl,
        config.options.supabaseKey
      );
    default:
      throw new Error(`Unsupported auth provider type: ${config.type}`);
  }
}
