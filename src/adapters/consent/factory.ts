import type { IConsentDataProvider } from '@/core/consent/IConsentDataProvider';
import { SupabaseConsentProvider } from '@/adapters/consent/supabase/supabaseConsent.provider';

export function createSupabaseConsentProvider(options: {
  supabaseUrl: string;
  supabaseKey: string;
  [key: string]: any;
}): IConsentDataProvider {
  return new SupabaseConsentProvider(options.supabaseUrl, options.supabaseKey);
}

export function createConsentProvider(config: {
  type: 'supabase' | string;
  options: Record<string, any>;
}): IConsentDataProvider {
  switch (config.type) {
    case 'supabase':
      return createSupabaseConsentProvider(config.options);
    default:
      throw new Error(`Unsupported consent provider type: ${config.type}`);
  }
}

export default createSupabaseConsentProvider;
