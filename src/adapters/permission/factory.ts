/**
 * Permission Data Provider Factory
 * 
 * This file provides factory functions for creating permission data providers.
 * It allows for dependency injection and makes it easy to swap implementations.
 */

import type { IPermissionDataProvider } from '@/core/permission/IPermissionDataProvider';
import { SupabasePermissionProvider } from '@/adapters/permission/supabasePermissionProvider';

/**
 * Create a Supabase permission data provider
 * 
 * @param supabaseUrl Supabase project URL
 * @param supabaseKey Supabase API key
 * @returns Supabase permission data provider instance
 */
export function createSupabasePermissionProvider(
  supabaseUrl: string,
  supabaseKey: string
): IPermissionDataProvider {
  return new SupabasePermissionProvider(supabaseUrl, supabaseKey);
}

/**
 * Create a permission data provider based on configuration
 * 
 * @param config Configuration object with provider type and options
 * @returns Permission data provider instance
 */
export function createPermissionProvider(config: {
  type: 'supabase' | string;
  options: Record<string, any>;
}): IPermissionDataProvider {
  switch (config.type) {
    case 'supabase':
      return createSupabasePermissionProvider(
        config.options.supabaseUrl,
        config.options.supabaseKey
      );
    default:
      throw new Error(`Unsupported permission provider type: ${config.type}`);
  }
}
