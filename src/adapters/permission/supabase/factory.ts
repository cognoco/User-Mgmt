/**
 * Supabase Permission Adapter Factory
 * 
 * This file implements a factory for creating Supabase permission adapters.
 */

import { IPermissionDataProvider as PermissionDataProvider } from '@/src/core/permission/IPermissionDataProvider'135;
import { SupabasePermissionProvider } from '@/src/adapters/permission/supabasePermissionProvider'254;

/**
 * Create a Supabase permission data provider
 * 
 * @param options Configuration options including supabaseUrl and supabaseKey
 * @returns A Supabase permission data provider instance
 */
export function createSupabasePermissionProvider(options: {
  supabaseUrl: string;
  supabaseKey: string;
  [key: string]: any;
}): PermissionDataProvider {
  return new SupabasePermissionProvider(options.supabaseUrl, options.supabaseKey);
}

/**
 * Default export for the Supabase permission provider factory
 */
export default createSupabasePermissionProvider;
