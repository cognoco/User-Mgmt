import { SupabaseAdminProvider } from '@/src/adapters/admin/supabaseAdmin.provider';
import type { IAdminDataProvider } from '@/core/admin';

export function createSupabaseAdminProvider(options: {
  supabaseUrl: string;
  supabaseKey: string;
  [key: string]: any;
}): IAdminDataProvider {
  return new SupabaseAdminProvider(options.supabaseUrl, options.supabaseKey);
}

export default createSupabaseAdminProvider;
