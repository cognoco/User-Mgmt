import type { IOrganizationDataProvider } from '@/core/organization/IOrganizationDataProvider';
import { SupabaseOrganizationProvider } from './supabase-organization-provider';

export function createSupabaseOrganizationProvider(url: string, key: string): IOrganizationDataProvider {
  return new SupabaseOrganizationProvider(url, key);
}

export function createOrganizationProvider(config: { type: 'supabase' | string; options: Record<string, any> }): IOrganizationDataProvider {
  switch (config.type) {
    case 'supabase':
      return createSupabaseOrganizationProvider(config.options.supabaseUrl, config.options.supabaseKey);
    default:
      throw new Error(`Unsupported organization provider type: ${config.type}`);
  }
}
