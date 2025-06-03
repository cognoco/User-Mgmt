import { type NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getServiceSupabase } from '@/lib/database/supabase';
import { getApiGDPRService } from '@/services/gdpr/factory';
import { getApiAuthService } from '@/services/auth/factory';
import { logUserAction } from '@/lib/audit/auditLogger';

const RequestDeletionSchema = z.object({
  mfaCode: z.string().min(6),
});

export async function POST(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
  }
  const token = authHeader.split(' ')[1];

  const supabaseService = getServiceSupabase();
  const {
    data: { user },
    error: userError,
  } = await supabaseService.auth.getUser(token);

  if (userError || !user) {
    return NextResponse.json({ error: userError?.message || 'Invalid token' }, { status: 401 });
  }

  const body = await request.json().catch(() => ({}));
  const parse = RequestDeletionSchema.safeParse(body);
  if (!parse.success) {
    return NextResponse.json({ error: 'Invalid confirmation data' }, { status: 400 });
  }

  try {
    const authService = getApiAuthService();
    const verifyRes = await authService.verifyMFA(parse.data.mfaCode);
    if (!verifyRes.success) {
      return NextResponse.json({ error: verifyRes.error || 'Invalid MFA code' }, { status: 401 });
    }

    const gdprService = getApiGDPRService();
    const scheduledDeletionAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
    const result = await gdprService.requestAccountDeletion(user.id, scheduledDeletionAt);
    if (!result.success || !result.request) {
      throw new Error(result.error || 'Failed to create deletion request');
    }

    await logUserAction({
      userId: user.id,
      action: 'ACCOUNT_DELETION_REQUESTED',
      status: 'SUCCESS',
      targetResourceType: 'user',
      targetResourceId: user.id,
    });

    return NextResponse.json(result.request);
  } catch (error) {
    await logUserAction({
      userId: user.id,
      action: 'ACCOUNT_DELETION_REQUEST_FAILED',
      status: 'FAILURE',
      targetResourceType: 'user',
      targetResourceId: user.id,
      details: { error: error instanceof Error ? error.message : String(error) },
    });
    return NextResponse.json({ error: 'Failed to request account deletion' }, { status: 500 });
  }
}
