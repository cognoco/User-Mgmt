import { AddressDataProvider } from './interfaces';
import { SupabaseAddressAdapter } from './supabase-adapter';

export function createSupabaseAddressProvider(supabaseUrl: string, supabaseKey: string): AddressDataProvider {
  return new SupabaseAddressAdapter(supabaseUrl, supabaseKey);
}

export function createAddressProvider(config: { type: 'supabase' | string; options: Record<string, any> }): AddressDataProvider {
  switch (config.type) {
    case 'supabase':
      return createSupabaseAddressProvider(config.options.supabaseUrl, config.options.supabaseKey);
    default:
      throw new Error(`Unsupported address provider type: ${config.type}`);
  }
}
