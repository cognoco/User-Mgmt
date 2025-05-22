import { ApiKeyDataProvider } from '../interfaces';
import { SupabaseApiKeyProvider } from '../supabase-adapter';

export default function createSupabaseApiKeyProvider(options: { supabaseUrl: string; supabaseKey: string; [key: string]: any }): ApiKeyDataProvider {
  return new SupabaseApiKeyProvider(options.supabaseUrl, options.supabaseKey);
}
