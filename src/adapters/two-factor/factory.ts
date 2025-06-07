import type { ITwoFactorDataProvider } from '@/core/two-factor/ITwoFactorDataProvider';
import { SupabaseTwoFactorProvider } from '@/adapters/two-factor/supabase/supabaseTwoFactor.provider';

export function createSupabaseTwoFactorProvider(options: {
  supabaseUrl: string;
  supabaseKey: string;
  [key: string]: any;
}): ITwoFactorDataProvider {
  return new SupabaseTwoFactorProvider(options.supabaseUrl, options.supabaseKey);
}

export function createTwoFactorProvider(config: {
  type: 'supabase' | string;
  options: Record<string, any>;
}): ITwoFactorDataProvider {
  switch (config.type) {
    case 'supabase':
      return createSupabaseTwoFactorProvider(config.options);
    default:
      throw new Error(`Unsupported two-factor provider type: ${config.type}`);
  }
}

export default createSupabaseTwoFactorProvider;
