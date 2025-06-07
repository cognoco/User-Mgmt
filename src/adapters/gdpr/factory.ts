/**
 * GDPR Data Provider Factory
 *
 * Provides helper functions to create GDPR adapters.
 */
import type { IGdprDataProvider } from '@/core/gdpr/IGdprDataProvider';
import { SupabaseGdprProvider } from '@/adapters/gdpr/supabase/supabaseGdpr.provider';

export function createSupabaseGdprProvider(options: {
  supabaseUrl: string;
  supabaseKey: string;
  [key: string]: any;
}): IGdprDataProvider {
  return new SupabaseGdprProvider(options.supabaseUrl, options.supabaseKey);
}

export function createGdprProvider(config: {
  type: 'supabase' | string;
  options: Record<string, any>;
}): IGdprDataProvider {
  switch (config.type) {
    case 'supabase':
      return createSupabaseGdprProvider(config.options);
    default:
      throw new Error(`Unsupported gdpr provider type: ${config.type}`);
  }
}

export default createSupabaseGdprProvider;
