import { IApiKeyDataProvider as ApiKeyDataProvider } from '@/src/core/apiKeys/IApiKeyDataProvider';
import { SupabaseApiKeyProvider } from '@/src/adapters/api-keys/supabaseAdapter';

export default function createSupabaseApiKeyProvider(options: { supabaseUrl: string; supabaseKey: string; [key: string]: any }): ApiKeyDataProvider {
  return new SupabaseApiKeyProvider(options.supabaseUrl, options.supabaseKey);
}
