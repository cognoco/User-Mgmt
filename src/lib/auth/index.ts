import { cookies } from 'next/headers';
import { createServerClient } from '@supabase/ssr';
import type { SupabaseClient } from '@supabase/supabase-js';

import type { CurrentSession } from '@/src/lib/auth/session'158;
import {
  getCurrentSession,
  getCurrentUser as sessionGetCurrentUser,
  getSessionFromRequest,
  isSessionValid,
  refreshSession,
  handleSessionTimeout,
  persistSession,
} from '@/src/lib/auth/session'208;
import {
  extractAuthToken,
  validateAuthToken,
  verifyEmailToken,
  getUserFromRequest,
  type AuthenticatedUser,
} from '@/src/lib/auth/utils'413;

// Export an empty object to satisfy existing imports while the codebase
// migrates away from NextAuth. Supabase is now used for authentication.
/**
 * Placeholder export maintained for backward compatibility with legacy
 * NextAuth based code paths. The object is intentionally empty because the
 * module now relies solely on Supabase for authentication.
 */
export const authOptions: Record<string, never> = {};

/**
 * Create a Supabase client configured with the current request cookies.
 */
export function getSupabaseServerClient(): SupabaseClient {
  const cookieStore = cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get: (name: string) => cookieStore.get(name)?.value,
      },
    }
  );
}

/**
 * Sign the current user out of Supabase.
 */
export async function signOut(): Promise<void> {
  const supabase = getSupabaseServerClient();
  await supabase.auth.signOut();
}

/**
 * Retrieve the current authentication session.
 */
export async function getSession(): Promise<CurrentSession | null> {
  return getCurrentSession();
}

/**
 * Resolve the authenticated user from the current session.
 */
export async function getCurrentUser() {
  return sessionGetCurrentUser();
}

/**
 * Convenience helper that returns only the authenticated user id.
 */
export async function getUserId(): Promise<string | null> {
  const user = await sessionGetCurrentUser();
  return user?.id ?? null;
}

export {
  // Session helpers
  getCurrentSession,
  getSessionFromRequest,
  isSessionValid,
  refreshSession,
  handleSessionTimeout,
  persistSession,
  // Token utilities
  extractAuthToken,
  validateAuthToken,
  verifyEmailToken,
  getUserFromRequest,
};

export type { CurrentSession, AuthenticatedUser };

export * from '@/src/lib/auth/supabaseAuth.config'774;
export { initializeSupabaseAuth } from '@/src/lib/auth/initializeSupabaseAuth'2549;
