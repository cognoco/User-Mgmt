import type { ISubscriptionDataProvider } from '@/core/subscription/ISubscriptionDataProvider';
import { SupabaseSubscriptionProvider } from '@/src/adapters/subscription/supabase/supabaseSubscription.provider'97;

export function createSupabaseSubscriptionProvider(options: { supabaseUrl: string; supabaseKey: string }): ISubscriptionDataProvider {
  return new SupabaseSubscriptionProvider(options.supabaseUrl, options.supabaseKey);
}

export function createSubscriptionProvider(config: { type: 'supabase' | string; options: Record<string, any> }): ISubscriptionDataProvider {
  switch (config.type) {
    case 'supabase':
      return createSupabaseSubscriptionProvider({
        supabaseUrl: config.options.supabaseUrl,
        supabaseKey: config.options.supabaseKey,
      });
    default:
      throw new Error(`Unsupported subscription provider type: ${config.type}`);
  }
}
