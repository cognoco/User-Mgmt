/**
 * Get the current user session from authentication headers
 * This should be used in API routes
 */
import { cookies } from 'next/headers';
import { createServerClient } from '@supabase/ssr';

/**
 * Retrieve the current user session from Supabase.
 *
 * This helper is meant for use in API routes where we need to access the
 * authenticated user. It validates the session using the cookies from the
 * incoming request.
 */
export async function getSession() {
  try {
    const cookieStore = cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get: (name: string) => cookieStore.get(name)?.value,
        },
      }
    );

    const { data, error } = await supabase.auth.getSession();

    if (error || !data.session) {
      return null;
    }

    return {
      userId: data.session.user.id,
      email: data.session.user.email ?? '',
      role: data.session.user.role ?? 'user',
    };
  } catch (error) {
    console.error('Error getting session:', error);
    return null;
  }
}

/**
 * Get the current user
 */
export async function getCurrentUser() {
  const session = await getSession();
  
  if (!session) {
    return null;
  }
  
  return {
    id: session.userId,
    email: session.email,
    role: session.role,
  };
} 
