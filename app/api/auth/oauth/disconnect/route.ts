import { NextResponse, type NextRequest } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { z } from 'zod';
import { OAuthProvider } from '@/types/oauth';
import { logUserAction } from '@/lib/audit/auditLogger';
import { PermissionValues } from '@/core/permission/models';
import { createApiHandler } from '@/lib/api/route-helpers';
import type { AuthContext, ServiceContainer } from '@/core/config/interfaces';

// Request schema
const disconnectRequestSchema = z.object({
  provider: z.nativeEnum(OAuthProvider),
});

async function handlePost(
  request: NextRequest,
  auth: AuthContext,
  data: z.infer<typeof disconnectRequestSchema>,
  services: ServiceContainer,
) {
  try {
    const { provider } = data;

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
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();
    if (authError || !user) {
      await logUserAction({
        action: 'SSO_UNLINK',
        status: 'FAILURE',
        details: { provider, error: 'Authentication required' },
      });
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 },
      );
    }

    // Permission check
    const hasPermission = await services.permission!.hasPermission(
      user.id,
      PermissionValues.MANAGE_SETTINGS,
    );
    if (!hasPermission) {
      await logUserAction({
        userId: user.id,
        action: 'SSO_UNLINK',
        status: 'FAILURE',
        details: { provider, error: 'Insufficient permissions' },
      });
      return NextResponse.json(
        { error: 'Insufficient permissions' },
        { status: 403 },
      );
    }
    // Fetch linked identities
    const {
      data: identityData,
      error: identityError,
    } = await supabase.auth.getUser();
    if (identityError || !identityData?.user) {
      return NextResponse.json(
        { error: identityError?.message || 'Failed to fetch identities' },
        { status: 400 },
      );
    }

    const identities = identityData.user.identities ?? [];
    const identity = identities.find(
      (i) => i.provider === provider.toLowerCase(),
    );
    if (!identity) {
      await logUserAction({
        userId: user.id,
        action: 'SSO_UNLINK',
        status: 'FAILURE',
        details: { provider, error: 'No linked account found' },
      });
      return NextResponse.json(
        { error: 'No linked account found for this provider.' },
        { status: 400 },
      );
    }

    const remaining = identities.filter(
      (i) => i.identity_id !== identity.identity_id,
    );
    if (remaining.length === 0) {
      await logUserAction({
        userId: user.id,
        action: 'SSO_UNLINK',
        status: 'FAILURE',
        details: {
          provider,
          error:
            'You must have at least one login method (password or another provider) before disconnecting this provider.',
        },
      });
      return NextResponse.json(
        {
          error:
            'You must have at least one login method (password or another provider) before disconnecting this provider.',
        },
        { status: 400 },
      );
    }

    const { error: unlinkError } = await supabase.auth.unlinkIdentity(identity);
    if (unlinkError) {
      await logUserAction({
        userId: user.id,
        action: 'SSO_UNLINK',
        status: 'FAILURE',
        details: { provider, error: unlinkError.message },
      });
      return NextResponse.json(
        { error: unlinkError.message },
        { status: 500 },
      );
    }

    await logUserAction({
      userId: user.id,
      action: 'SSO_UNLINK',
      status: 'SUCCESS',
      details: { provider },
    });

    return NextResponse.json({ success: true });
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

export const POST = createApiHandler(
  disconnectRequestSchema,
  handlePost,
  { requireAuth: true },
);
