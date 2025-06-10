import type { ICompanyNotificationDataProvider } from '@/core/companyNotification/ICompanyNotificationDataProvider';
import { SupabaseCompanyNotificationProvider } from '@/adapters/company-notification/supabase/supabaseCompanyNotification.provider';

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
