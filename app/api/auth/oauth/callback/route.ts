import { NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { z } from 'zod';
import { OAuthProvider } from '@/types/oauth';
import { logUserAction } from '@/lib/audit/auditLogger';

// Request schema
const callbackRequestSchema = z.object({
  provider: z.nativeEnum(OAuthProvider),
  code: z.string(),
  redirectUri: z.string().url(),
  state: z.string().optional(), // Add state for CSRF protection
});

export async function POST(request: Request) {
  try {
    // Parse and validate request body
    const body = await request.json();
    const { provider, code, state } = callbackRequestSchema.parse(body);

    // CSRF protection: validate state parameter
    const cookieStore = cookies();
    const stateCookie = cookieStore.get(`oauth_state_${provider}`)?.value;
    if (!state || !stateCookie || state !== stateCookie) {
      return NextResponse.json({ error: 'Invalid or missing state parameter. Possible CSRF attack.' }, { status: 400 });
    }
    // Optionally clear the state cookie after use
    cookieStore.set({ name: `oauth_state_${provider}`, value: '', maxAge: 0, path: '/' });

    // Initialize Supabase client
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

    // Check if a user is already authenticated (session present)
    const { data: currentSession, error: sessionError } = await supabase.auth.getSession();
    if (sessionError) {
      return NextResponse.json({ error: 'Failed to check current session.' }, { status: 500 });
    }
    if (currentSession?.session) {
      // User is already logged in; this should be handled as account linking
      // For now, return a clear error and instruct to use the /oauth/link endpoint
      return NextResponse.json({ error: 'User already authenticated. Use the account linking endpoint to link a new provider.' }, { status: 409 });
    }

    // Exchange authorization code for tokens
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);
    if (error) {
      // Handle revoked provider access
      if (error.message && error.message.toLowerCase().includes('revoked')) {
        return NextResponse.json(
          { error: 'Access to your provider account has been revoked. Please re-link your account or use another login method.' },
          { status: 400 }
        );
      }
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

    // --- Provider linkage logic using Prisma Account model ---
    const { prisma } = await import('@/lib/database/prisma');
    const providerAccountId = userData.user.app_metadata?.provider_id;
    const email = userData.user.email;
    if (!providerAccountId && !email) {
      return NextResponse.json({ error: 'Provider did not return a unique identifier (email or provider user ID).' }, { status: 400 });
    }

    // 1. Try to find an existing account for this provider+providerAccountId
    let account = null;
    if (providerAccountId) {
      account = await prisma.account.findUnique({
        where: {
          provider_provider_account_id: {
            provider: provider.toLowerCase(),
            provider_account_id: providerAccountId,
          },
        },
        include: { users: true },
      });
    }

    // 2. If account exists, update email if changed
    if (account) {
      if (email && account.provider_email !== email) {
        await prisma.account.update({
          where: { id: account.id },
          data: { provider_email: email },
        });
      }
      // Return the linked user
      return NextResponse.json({
        user: account.users,
        token: data.session?.access_token,
        isNewUser: false,
        info: 'Logged in via linked provider account.'
      });
    }

    // 3. If no account, check for email collision
    let emailCollision = null;
    if (email) {
      emailCollision = await prisma.account.findFirst({
        where: { provider_email: email },
        include: { users: true },
      });
    }
    if (emailCollision) {
      // Email collision: require explicit confirmation or handle as needed
      return NextResponse.json({
        error: 'An account with this email already exists. Please log in and link your provider from your account settings.',
        collision: true,
      }, { status: 409 });
    }

    // 4. No collision, create new account record
    const newAccount = await prisma.account.create({
      data: {
        user_id: userData.user.id,
        provider: provider.toLowerCase(),
        provider_account_id: providerAccountId || '',
        provider_email: email || '',
      },
      include: { users: true },
    });

    // Return the linked user for the new account
    return NextResponse.json({
      user: newAccount.users,
      token: data.session?.access_token,
      isNewUser: true,
      info: 'New provider account linked and user created.'
    });

    // --- End provider linkage logic ---

    // Defensive: If userData.user is null, return error (should not happen here)
    if (!userData.user) {
      return NextResponse.json({ error: 'User data missing after provider linkage.' }, { status: 500 });
    }

    // Get user metadata to check if this is a new sign-up
    const isNewUser = userData.user!.app_metadata?.provider_id === provider && 
                     userData.user!.created_at === userData.user!.updated_at;

    // Return the user and session data
    // --- Audit log: SSO login ---
    try {
      await logUserAction({
        userId: userData.user!.id,
        action: 'SSO_LOGIN',
        status: 'SUCCESS',
        targetResourceType: 'auth',
        targetResourceId: userData.user!.id,
        details: { provider, email, isNewUser },
        // Optionally: ipAddress, userAgent (if available from request headers)
      });
    } catch (logError) {
      // Log but do not block the response
      console.error('Failed to log SSO_LOGIN action:', logError);
    }
    return NextResponse.json({
      user: userData.user!,
      token: data.session?.access_token,
      isNewUser
    });
  } catch (error) {
    console.error('Error in OAuth callback:', error);
    // --- Audit log: SSO login failure ---
    try {
      await logUserAction({
        action: 'SSO_LOGIN',
        status: 'FAILURE',
        details: { error: error instanceof Error ? error.message : 'Unknown error' },
      });
    } catch (logError) {
      console.error('Failed to log SSO_LOGIN failure:', logError);
    }
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'An unexpected error occurred' },
      { status: 500 }
    );
  }
} 