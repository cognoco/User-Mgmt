/**
 * Session Data Provider Factory
 */

import type { ISessionDataProvider } from '@/core/session/ISessionDataProvider';
import { SupabaseSessionProvider } from '@/adapters/session/supabaseAdapter';

export function createSupabaseSessionProvider(options: {
  supabaseUrl: string;
  supabaseKey: string;
  [key: string]: any;
}): ISessionDataProvider {
  return new SupabaseSessionProvider(options.supabaseUrl, options.supabaseKey);
}

export function createSessionProvider(config: {
  type: 'supabase' | string;
  options: Record<string, any>;
}): ISessionDataProvider {
  switch (config.type) {
    case 'supabase':
      return createSupabaseSessionProvider(config.options);
    default:
      throw new Error(`Unsupported session provider type: ${config.type}`);
  }
}

export default createSupabaseSessionProvider;
