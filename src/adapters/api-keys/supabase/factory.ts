import { IApiKeyDataProvider as ApiKeyDataProvider } from '@/src/core/apiKeys/IApiKeyDataProvider'0;
import { SupabaseApiKeyProvider } from '@/src/adapters/api-keys/supabaseAdapter'105;

export default function createSupabaseApiKeyProvider(options: { supabaseUrl: string; supabaseKey: string; [key: string]: any }): ApiKeyDataProvider {
  return new SupabaseApiKeyProvider(options.supabaseUrl, options.supabaseKey);
}
