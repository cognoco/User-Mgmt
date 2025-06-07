import type { IAuditDataProvider } from '@/core/audit/IAuditDataProvider';
import { SupabaseAuditAdapter } from '@/adapters/audit/supabaseAdapter';

export function createSupabaseAuditProvider(
  supabaseUrl: string,
  supabaseKey: string
): IAuditDataProvider {
  return new SupabaseAuditAdapter(supabaseUrl, supabaseKey);
}

export function createAuditProvider(config: {
  type: 'supabase' | string;
  options: Record<string, any>;
}): IAuditDataProvider {
  switch (config.type) {
    case 'supabase':
      return createSupabaseAuditProvider(
        config.options.supabaseUrl,
        config.options.supabaseKey
      );
    default:
      throw new Error(`Unsupported audit provider type: ${config.type}`);
  }
}
