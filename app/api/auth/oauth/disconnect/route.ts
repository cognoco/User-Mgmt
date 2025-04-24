import { NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { z } from 'zod';
import { OAuthProvider } from '@/types/oauth';
import { logUserAction } from '@/lib/audit/auditLogger';

// Request schema
const disconnectRequestSchema = z.object({
  provider: z.nativeEnum(OAuthProvider),
});

export async function POST(request: Request) {
  try {
    // Parse and validate request body
    const body = await request.json();
    const { provider } = disconnectRequestSchema.parse(body);

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

    // Verify user authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // --- Provider unlink logic using Prisma Account model ---
    const { prisma } = await import('@/lib/database/prisma');
    // Find all accounts for this user
    const userAccounts = await prisma.account.findMany({
      where: { user_id: user.id },
    });
    // Block unlink if this is the last login method (no other accounts and no password)
    const hasPassword = !!user.user_metadata?.hasPassword; // Adjust if you have a real password check
    if (userAccounts.length <= 1 && !hasPassword) {
      return NextResponse.json(
        { error: 'You must have at least one login method (password or another provider) before disconnecting this provider.' },
        { status: 400 }
      );
    }
    // Remove the account for this provider
    const deleted = await prisma.account.deleteMany({
      where: {
        user_id: user.id,
        provider: provider.toLowerCase(),
      },
    });
    if (deleted.count === 0) {
      // Audit log: SSO unlink failure
      try {
        await logUserAction({
          userId: user.id,
          action: 'SSO_UNLINK',
          status: 'FAILURE',
          details: { provider, error: 'No linked account found for this provider.' },
        });
      } catch (logError) {
        console.error('Failed to log SSO_UNLINK failure:', logError);
      }
      return NextResponse.json(
        { error: 'No linked account found for this provider.' },
        { status: 400 }
      );
    }
    // Audit log: SSO unlink success
    try {
      await logUserAction({
        userId: user.id,
        action: 'SSO_UNLINK',
        status: 'SUCCESS',
        details: { provider },
      });
    } catch (logError) {
      console.error('Failed to log SSO_UNLINK success:', logError);
    }
    return NextResponse.json({ success: true });
    // --- End provider unlink logic ---
  } catch (error) {
    console.error('Error in OAuth disconnect:', error);
    // Audit log: SSO unlink failure (unexpected error)
    try {
      await logUserAction({
        action: 'SSO_UNLINK',
        status: 'FAILURE',
        details: { error: error instanceof Error ? error.message : 'Unknown error' },
      });
    } catch (logError) {
      console.error('Failed to log SSO_UNLINK failure:', logError);
    }
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'An unexpected error occurred' },
      { status: 500 }
    );
  }
} 