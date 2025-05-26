import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import type { User } from '@supabase/supabase-js';
import { auth } from '@/lib/auth/authConfig';

/**
 * Retrieves the authenticated user from the session
 * 
 * @returns The authenticated user or null if not authenticated
 */
export async function getUser() {
  // For E2E tests and development, return a mock user
  if (process.env.NODE_ENV === 'development' || process.env.E2E_TEST === 'true') {
    console.log('[DEV/TEST] Returning mock user');
    return {
      id: 'mock-user-id',
      name: 'Mock Admin',
      email: 'admin@example.com',
      role: 'ADMIN',
      emailVerified: true,
      image: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  }
  
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return null;
    }

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

    const { data, error } = await supabase.auth.getUser();

    if (error || !data.user) {
      return null;
    }

    const user: User = data.user;

    return {
      id: user.id,
      name: user.user_metadata?.name || null,
      email: user.email,
      role: user.role || 'user',
      emailVerified: !!user.email_confirmed_at,
      image: user.user_metadata?.avatar_url || null,
      createdAt: new Date(user.created_at),
      updatedAt: new Date(user.updated_at),
    };
  } catch (error) {
    console.error('Error retrieving user:', error);
    return null;
  }
}
