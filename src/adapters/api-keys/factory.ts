import { ApiKeyDataProvider } from './interfaces';
import { SupabaseApiKeyProvider } from './supabase-adapter';

export function createSupabaseApiKeyProvider(options: { supabaseUrl: string; supabaseKey: string; [key: string]: any }): ApiKeyDataProvider {
  return new SupabaseApiKeyProvider(options.supabaseUrl, options.supabaseKey);
}

export function createApiKeyProvider(config: { type: 'supabase' | string; options: Record<string, any> }): ApiKeyDataProvider {
  switch (config.type) {
    case 'supabase':
      return createSupabaseApiKeyProvider(config.options);
    default:
      throw new Error(`Unsupported api key provider type: ${config.type}`);
  }
}
