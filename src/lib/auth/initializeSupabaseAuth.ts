import { createClient, SupabaseClient } from '@supabase/supabase-js';
import {
  supabaseAuthConfig,
  validateSupabaseAuthConfig,
  type SupabaseAuthConfig,
} from '@/src/lib/auth/supabaseAuth.config';

let supabaseClient: SupabaseClient | null = null;

/**
 * Initialize the Supabase client for authentication.
 *
 * This uses configuration from {@link supabaseAuthConfig} unless overridden.
 * The function will attach an auth state change listener and configure
 * persistence options based on the provided configuration.
 */
export function initializeSupabaseAuth(
  config: Partial<SupabaseAuthConfig> = {},
): SupabaseClient {
  if (supabaseClient) return supabaseClient;

  const finalConfig: SupabaseAuthConfig = { ...supabaseAuthConfig, ...config };

  if (!validateSupabaseAuthConfig(finalConfig)) {
    throw new Error('Invalid Supabase auth configuration');
  }

  try {
    console.log('[initializeSupabaseAuth] creating client');
    supabaseClient = createClient(finalConfig.url, finalConfig.anonKey, {
      auth: {
        persistSession: finalConfig.persistSession,
        autoRefreshToken: finalConfig.autoRefreshToken,
        storageKey: finalConfig.cookieName,
      },
    });

    supabaseClient.auth.onAuthStateChange((event, session) => {
      console.log('[initializeSupabaseAuth] auth event', event);
      if (session) {
        console.log(
          '[initializeSupabaseAuth] session expires at',
          session.expires_at,
        );
      }
    });

    return supabaseClient;
  } catch (error) {
    console.error('[initializeSupabaseAuth] failed to init', error);
    throw error;
  }
}

