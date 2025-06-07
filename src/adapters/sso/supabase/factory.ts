/**
 * Supabase SSO Adapter Factory
 */

import { ISsoDataProvider as SsoDataProvider } from '@/src/core/sso/ISsoDataProvider';
import { SupabaseSsoProvider } from '@/src/adapters/sso/supabase/supabaseAdapter';

export function createSupabaseSsoProvider(options: {
  supabaseUrl: string;
  supabaseKey: string;
  [key: string]: any;
}): SsoDataProvider {
  return new SupabaseSsoProvider(options.supabaseUrl, options.supabaseKey);
}

export default createSupabaseSsoProvider;
