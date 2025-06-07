import type { IOrganizationDataProvider } from '@/core/organization/IOrganizationDataProvider';
import { DefaultOrganizationAdapter } from '@/src/adapters/organization/defaultOrganizationAdapter';
import { SupabaseOrganizationProvider } from '@/src/adapters/organization/supabase/supabaseOrganization.provider';

export function createDefaultOrganizationProvider(): IOrganizationDataProvider {
  return new DefaultOrganizationAdapter();
}

export function createSupabaseOrganizationProvider(options: {
  supabaseUrl: string;
  supabaseKey: string;
  [key: string]: any;
}): IOrganizationDataProvider {
  return new SupabaseOrganizationProvider(options.supabaseUrl, options.supabaseKey);
}

export function createOrganizationProvider(config?: {
  type?: 'default' | 'supabase' | string;
  options?: Record<string, any>;
}): IOrganizationDataProvider {
  if (!config || config.type === 'default') {
    return createDefaultOrganizationProvider();
  }
  if (config.type === 'supabase') {
    return createSupabaseOrganizationProvider(config.options || {});
  }
  throw new Error(`Unsupported organization provider type: ${config.type}`);
}

export default createSupabaseOrganizationProvider;
