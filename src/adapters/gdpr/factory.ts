/**
 * GDPR Data Provider Factory
 *
 * Provides helper functions to create GDPR adapters.
 */
import { GdprDataProvider } from './interfaces';
import { SupabaseGdprAdapter } from './supabase-adapter';

export function createSupabaseGdprProvider(options: {
  supabaseUrl: string;
  supabaseKey: string;
  [key: string]: any;
}): GdprDataProvider {
  return new SupabaseGdprAdapter(options.supabaseUrl, options.supabaseKey);
}

export function createGdprProvider(config: {
  type: 'supabase' | string;
  options: Record<string, any>;
}): GdprDataProvider {
  switch (config.type) {
    case 'supabase':
      return createSupabaseGdprProvider(config.options);
    default:
      throw new Error(`Unsupported gdpr provider type: ${config.type}`);
  }
}

export default createSupabaseGdprProvider;
