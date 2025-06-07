/**
 * User Data Provider Factory
 * 
 * This file provides factory functions for creating user data providers.
 * It allows for dependency injection and makes it easy to swap implementations.
 */

import type { IUserDataProvider } from '@/core/user/IUserDataProvider';
import { SupabaseUserProvider } from '@/src/adapters/user/supabaseUserProvider'278;

/**
 * Create a Supabase user data provider
 * 
 * @param supabaseUrl Supabase project URL
 * @param supabaseKey Supabase API key
 * @returns Supabase user data provider instance
 */
export function createSupabaseUserProvider(
  supabaseUrl: string,
  supabaseKey: string
): IUserDataProvider {
  return new SupabaseUserProvider(supabaseUrl, supabaseKey);
}

/**
 * Create a user data provider based on configuration
 * 
 * @param config Configuration object with provider type and options
 * @returns User data provider instance
 */
export function createUserProvider(config: {
  type: 'supabase' | string;
  options: Record<string, any>;
}): IUserDataProvider {
  switch (config.type) {
    case 'supabase':
      return createSupabaseUserProvider(
        config.options.supabaseUrl,
        config.options.supabaseKey
      );
    default:
      throw new Error(`Unsupported user provider type: ${config.type}`);
  }
}
