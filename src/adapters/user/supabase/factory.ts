/**
 * Supabase User Adapter Factory
 * 
 * This file implements a factory for creating Supabase user adapters.
 */

import { IUserDataProvider as UserDataProvider } from '@/src/core/user/IUserDataProvider';
import { SupabaseUserProvider } from '@/src/adapters/user/supabaseUserProvider';

/**
 * Create a Supabase user data provider
 * 
 * @param options Configuration options including supabaseUrl and supabaseKey
 * @returns A Supabase user data provider instance
 */
export function createSupabaseUserProvider(options: {
  supabaseUrl: string;
  supabaseKey: string;
  [key: string]: any;
}): UserDataProvider {
  return new SupabaseUserProvider(options.supabaseUrl, options.supabaseKey);
}

/**
 * Default export for the Supabase user provider factory
 */
export default createSupabaseUserProvider;
