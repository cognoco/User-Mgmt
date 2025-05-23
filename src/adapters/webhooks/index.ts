import { SupabaseWebhookProvider } from './supabase/supabase-webhook.provider';
import type { IWebhookDataProvider } from './IWebhookDataProvider';

export function createSupabaseWebhookProvider(options: {
  supabaseUrl: string;
  supabaseKey: string;
  [key: string]: any;
}): IWebhookDataProvider {
  return new SupabaseWebhookProvider(options.supabaseUrl, options.supabaseKey);
}

export function createWebhookProvider(config: {
  type: 'supabase' | string;
  options: Record<string, any>;
}): IWebhookDataProvider {
  switch (config.type) {
    case 'supabase':
      return createSupabaseWebhookProvider(config.options);
    default:
      throw new Error(`Unsupported webhook provider type: ${config.type}`);
  }
}

export { SupabaseWebhookProvider };
export default createSupabaseWebhookProvider;
