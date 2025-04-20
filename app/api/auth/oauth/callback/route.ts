import { NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { z } from 'zod';
import { OAuthProvider } from '@/types/oauth';

// Request schema
const callbackRequestSchema = z.object({
  provider: z.nativeEnum(OAuthProvider),
  code: z.string(),
  redirectUri: z.string().url(),
});

export async function POST(request: Request) {
  try {
    // Parse and validate request body
    const body = await request.json();
    const { provider, code, redirectUri } = callbackRequestSchema.parse(body);

    // Initialize Supabase client
    const cookieStore = cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return cookieStore.get(name)?.value;
          },
          set(name: string, value: string, options: any) {
            cookieStore.set({ name, value, ...options });
          },
          remove(name: string, options: any) {
            cookieStore.set({ name, value: '', ...options });
          },
        },
      }
    );

    // Exchange authorization code for tokens
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);

    if (error) {
      console.error('OAuth callback error:', error);
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      );
    }

    // Use the session's access token to fetch user data
    const { data: userData, error: userError } = await supabase.auth.getUser();

    if (userError || !userData?.user) {
      console.error('Failed to fetch user data:', userError);
      return NextResponse.json(
        { error: userError?.message || 'Failed to fetch user data' },
        { status: 400 }
      );
    }

    // Get user metadata to check if this is a new sign-up
    const isNewUser = userData.user.app_metadata?.provider_id === provider && 
                     userData.user.created_at === userData.user.updated_at;

    // Return the user and session data
    return NextResponse.json({
      user: userData.user,
      token: data.session?.access_token,
      isNewUser
    });
  } catch (error) {
    console.error('Error in OAuth callback:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'An unexpected error occurred' },
      { status: 500 }
    );
  }
} 