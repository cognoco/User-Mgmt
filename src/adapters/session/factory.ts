/**
 * Session Data Provider Factory
 */

import { SessionDataProvider } from './interfaces';
import { SupabaseSessionProvider } from './supabase-adapter';

export function createSupabaseSessionProvider(options: {
  supabaseUrl: string;
  supabaseKey: string;
  [key: string]: any;
}): SessionDataProvider {
  return new SupabaseSessionProvider(options.supabaseUrl, options.supabaseKey);
}

export function createSessionProvider(config: {
  type: 'supabase' | string;
  options: Record<string, any>;
}): SessionDataProvider {
  switch (config.type) {
    case 'supabase':
      return createSupabaseSessionProvider(config.options);
    default:
      throw new Error(`Unsupported session provider type: ${config.type}`);
  }
}

export default createSupabaseSessionProvider;
