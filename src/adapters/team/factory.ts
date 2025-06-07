/**
 * Team Data Provider Factory
 * 
 * This file provides factory functions for creating team data providers.
 * It allows for dependency injection and makes it easy to swap implementations.
 */

import type { ITeamDataProvider } from '@/core/team/ITeamDataProvider';
import { SupabaseTeamProvider } from '@/src/adapters/team/supabaseTeamProvider';

/**
 * Create a Supabase team data provider
 * 
 * @param supabaseUrl Supabase project URL
 * @param supabaseKey Supabase API key
 * @returns Supabase team data provider instance
 */
export function createSupabaseTeamProvider(
  supabaseUrl: string,
  supabaseKey: string
): ITeamDataProvider {
  return new SupabaseTeamProvider(supabaseUrl, supabaseKey);
}

/**
 * Create a team data provider based on configuration
 * 
 * @param config Configuration object with provider type and options
 * @returns Team data provider instance
 */
export function createTeamProvider(config: {
  type: 'supabase' | string;
  options: Record<string, any>;
}): ITeamDataProvider {
  switch (config.type) {
    case 'supabase':
      return createSupabaseTeamProvider(
        config.options.supabaseUrl,
        config.options.supabaseKey
      );
    default:
      throw new Error(`Unsupported team provider type: ${config.type}`);
  }
}
