import { cookies } from 'next/headers';
import { createServerClient } from '@supabase/ssr';
import type { SupabaseClient } from '@supabase/supabase-js';

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

export * from './supabase-auth.config';
