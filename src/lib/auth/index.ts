import { cookies } from 'next/headers';
import { createServerClient } from '@supabase/ssr';

// Export an empty object to satisfy existing imports while the codebase
// migrates away from NextAuth. Supabase is now used for authentication.
export const authOptions: any = {};

/**
 * Create a Supabase client configured with the current request cookies.
 */
export function getSupabaseServerClient() {
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

export async function signOut() {
  const supabase = getSupabaseServerClient();
  await supabase.auth.signOut();
}

export * from './supabase-auth.config';
