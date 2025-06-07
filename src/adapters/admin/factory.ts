import type { IAdminDataProvider } from '@/core/admin';
import { SupabaseAdminProvider } from '@/src/adapters/admin/supabaseAdmin.provider';

export function createSupabaseAdminProvider(
  supabaseUrl: string,
  supabaseKey: string
): IAdminDataProvider {
  return new SupabaseAdminProvider(supabaseUrl, supabaseKey);
}

export function createAdminProvider(config: {
  type: 'supabase' | string;
  options: Record<string, any>;
}): IAdminDataProvider {
  switch (config.type) {
    case 'supabase':
      return createSupabaseAdminProvider(
        config.options.supabaseUrl,
        config.options.supabaseKey
      );
    default:
      throw new Error(`Unsupported admin provider type: ${config.type}`);
  }
}

export default createSupabaseAdminProvider;
