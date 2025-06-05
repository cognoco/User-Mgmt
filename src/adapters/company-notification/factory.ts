import type { ICompanyNotificationDataProvider } from '@/core/company-notification/ICompanyNotificationDataProvider';
import { SupabaseCompanyNotificationProvider } from './supabase/supabase-company-notification.provider';

export function createSupabaseCompanyNotificationProvider(options: {
  supabaseUrl: string;
  supabaseKey: string;
  [key: string]: any;
}): ICompanyNotificationDataProvider {
  return new SupabaseCompanyNotificationProvider(options.supabaseUrl, options.supabaseKey);
}

export function createCompanyNotificationProvider(config?: {
  type?: 'supabase' | string;
  options?: Record<string, any>;
}): ICompanyNotificationDataProvider {
  if (!config || config.type === 'supabase') {
    return createSupabaseCompanyNotificationProvider(config?.options || {} as any);
  }
  throw new Error(`Unsupported company notification provider type: ${config.type}`);
}

export default createSupabaseCompanyNotificationProvider;
