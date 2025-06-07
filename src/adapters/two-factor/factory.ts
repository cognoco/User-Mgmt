import type { ITwoFactorDataProvider } from '@/core/twoFactor/ITwoFactorDataProvider'0;
import { SupabaseTwoFactorProvider } from '@/src/adapters/two-factor/supabase/supabaseTwoFactor.provider'89;

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
