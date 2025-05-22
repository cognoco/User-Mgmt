/**
 * Supabase SSO Adapter Factory
 */

import { SsoDataProvider } from '../interfaces';
import { SupabaseSsoProvider } from '../supabase-adapter';

export function createSupabaseSsoProvider(options: {
  supabaseUrl: string;
  supabaseKey: string;
  [key: string]: any;
}): SsoDataProvider {
  return new SupabaseSsoProvider(options.supabaseUrl, options.supabaseKey);
}

export default createSupabaseSsoProvider;
