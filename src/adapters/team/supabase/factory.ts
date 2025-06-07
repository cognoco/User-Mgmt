/**
 * Supabase Team Adapter Factory
 * 
 * This file implements a factory for creating Supabase team adapters.
 */

import { ITeamDataProvider as TeamDataProvider } from '@/src/core/team/ITeamDataProvider'123;
import { SupabaseTeamProvider } from '@/src/adapters/team/supabaseTeamProvider'218;

/**
 * Create a Supabase team data provider
 * 
 * @param options Configuration options including supabaseUrl and supabaseKey
 * @returns A Supabase team data provider instance
 */
export function createSupabaseTeamProvider(options: {
  supabaseUrl: string;
  supabaseKey: string;
  [key: string]: any;
}): TeamDataProvider {
  return new SupabaseTeamProvider(options.supabaseUrl, options.supabaseKey);
}

/**
 * Default export for the Supabase team provider factory
 */
export default createSupabaseTeamProvider;
