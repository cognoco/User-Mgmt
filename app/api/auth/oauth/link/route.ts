import { NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { z } from 'zod';
import { OAuthProvider } from '@/types/oauth';
import { logUserAction } from '@/lib/audit/auditLogger';

// Request schema
const linkRequestSchema = z.object({
  provider: z.nativeEnum(OAuthProvider),
  code: z.string(),
});

export async function POST(request: Request) {
  try {
    // Parse and validate request body
    const body = await request.json();
    const { provider, code } = linkRequestSchema.parse(body);

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

    // Authenticate user (must be logged in to link a provider)
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Exchange code for provider tokens/session
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    // Fetch provider user info
    const { data: providerUserData, error: providerUserError } = await supabase.auth.getUser();
    if (providerUserError || !providerUserData?.user) {
      return NextResponse.json({ error: providerUserError?.message || 'Failed to fetch provider user data' }, { status: 400 });
    }
    const providerAccountId = providerUserData.user.app_metadata?.provider_id;
    const email = providerUserData.user.email;
    if (!providerAccountId && !email) {
      return NextResponse.json({ error: 'Provider did not return a unique identifier (email or provider user ID).' }, { status: 400 });
    }

    // Use Prisma to check for existing account
    const { prisma } = await import('@/lib/database/prisma');
    const existingAccount = await prisma.account.findUnique({
      where: {
        provider_provider_account_id: {
          provider: provider.toLowerCase(),
          provider_account_id: providerAccountId,
        },
      },
    });
    if (existingAccount) {
      return NextResponse.json({ error: 'This provider is already linked to an account.' }, { status: 409 });
    }

    // Check for email collision
    let emailCollision = null;
    if (email) {
      emailCollision = await prisma.account.findFirst({
        where: { provider_email: email },
      });
    }
    if (emailCollision) {
      return NextResponse.json({
        error: 'An account with this email already exists. Please use another provider or contact support.',
        collision: true,
      }, { status: 409 });
    }

    // Create new account record
    await prisma.account.create({
      data: {
        user_id: user.id,
        provider: provider.toLowerCase(),
        provider_account_id: providerAccountId || '',
        provider_email: email || '',
      },
    });

    // Audit log: SSO link success
    try {
      await logUserAction({
        userId: user.id,
        action: 'SSO_LINK',
        status: 'SUCCESS',
        details: { provider },
      });
    } catch (logError) {
      console.error('Failed to log SSO_LINK success:', logError);
    }

    // Return updated provider list and user info
    const linkedAccounts = await prisma.account.findMany({
      where: { user_id: user.id },
      select: { provider: true },
    });
    return NextResponse.json({
      success: true,
      linkedProviders: linkedAccounts.map((a: { provider: string }) => a.provider),
      user,
    });
  } catch (error: any) {
    // Audit log: SSO link failure
    try {
      await logUserAction({
        action: 'SSO_LINK',
        status: 'FAILURE',
        details: { error: error.message || 'Failed to link provider.' },
      });
    } catch (logError) {
      // Log but do not block the response
      console.error('Failed to log SSO_LINK failure:', logError);
    }
    return NextResponse.json({ error: error.message || 'Failed to link provider.' }, { status: 400 });
  }
} 