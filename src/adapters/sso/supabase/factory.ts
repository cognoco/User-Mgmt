/**
 * Supabase SSO Adapter Factory
 */

import { ISsoDataProvider as SsoDataProvider } from '@/src/core/sso/ISsoDataProvider'45;
import { SupabaseSsoProvider } from '@/src/adapters/sso/supabase/supabaseAdapter'136;

export function createSupabaseSsoProvider(options: {
  supabaseUrl: string;
  supabaseKey: string;
  [key: string]: any;
}): SsoDataProvider {
  return new SupabaseSsoProvider(options.supabaseUrl, options.supabaseKey);
}

export default createSupabaseSsoProvider;
