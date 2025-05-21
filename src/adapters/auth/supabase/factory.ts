/**
 * Supabase Auth Adapter Factory
 * 
 * This file implements a factory for creating Supabase auth adapters.
 */

import { AuthDataProvider } from '../interfaces';
import { SupabaseAuthProvider } from '../supabase-auth-provider';

/**
 * Create a Supabase auth data provider
 * 
 * @param options Configuration options including supabaseUrl and supabaseKey
 * @returns A Supabase auth data provider instance
 */
export function createSupabaseAuthProvider(options: {
  supabaseUrl: string;
  supabaseKey: string;
  [key: string]: any;
}): AuthDataProvider {
  return new SupabaseAuthProvider(options.supabaseUrl, options.supabaseKey);
}

/**
 * Default export for the Supabase auth provider factory
 */
export default createSupabaseAuthProvider;
