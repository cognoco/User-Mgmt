import type { ICsrfDataProvider } from '@/core/csrf/ICsrfDataProvider';
import { DefaultCsrfProvider } from '@/src/adapters/csrf/defaultAdapter';
import { SupabaseCsrfProvider } from '@/src/adapters/csrf/supabase/supabaseCsrf.provider';

export function createDefaultCsrfProvider(): ICsrfDataProvider {
  return new DefaultCsrfProvider();
}

export function createSupabaseCsrfProvider(options: {
  supabaseUrl: string;
  supabaseKey: string;
  [key: string]: any;
}): ICsrfDataProvider {
  return new SupabaseCsrfProvider(options.supabaseUrl, options.supabaseKey);
}

export function createCsrfProvider(config?: {
  type?: 'default' | 'supabase' | string;
  options?: Record<string, any>;
}): ICsrfDataProvider {
  if (!config || config.type === 'default') {
    return createDefaultCsrfProvider();
  }
  if (config.type === 'supabase') {
    return createSupabaseCsrfProvider(config.options || {});
  }
  throw new Error(`Unsupported CSRF provider type: ${config.type}`);
}

export default createSupabaseCsrfProvider;
