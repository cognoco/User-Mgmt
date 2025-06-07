import { IApiKeyDataProvider as ApiKeyDataProvider } from '@/core/apiKeys/IApiKeyDataProvider';
import { SupabaseApiKeyProvider } from '@/adapters/api-keys/supabaseAdapter';

export default function createSupabaseApiKeyProvider(options: { supabaseUrl: string; supabaseKey: string; [key: string]: any }): ApiKeyDataProvider {
  return new SupabaseApiKeyProvider(options.supabaseUrl, options.supabaseKey);
}
