import { AuditDataProvider } from './interfaces';
import { SupabaseAuditAdapter } from './supabase-adapter';

export function createSupabaseAuditProvider(
  supabaseUrl: string,
  supabaseKey: string
): AuditDataProvider {
  return new SupabaseAuditAdapter(supabaseUrl, supabaseKey);
}

export function createAuditProvider(config: {
  type: 'supabase' | string;
  options: Record<string, any>;
}): AuditDataProvider {
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
