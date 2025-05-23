import { type NextRequest, NextResponse } from 'next/server';
import { getServiceSupabase } from '@/lib/database/supabase';
import { logUserAction } from '@/lib/audit/auditLogger';
import { getApiGDPRService } from '@/services/gdpr/factory';

export async function POST(request: NextRequest) {
  // 1. Authentication (Essential)
  const authHeader = request.headers.get('authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    await logUserAction({
      action: 'ACCOUNT_DELETION_ATTEMPT',
      status: 'FAILURE',
      ipAddress: request.ip,
      userAgent: request.headers.get('user-agent'),
      targetResourceType: 'user',
      details: { reason: 'Missing or invalid authorization token' }
    });
    return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
  }
  const token = authHeader.split(' ')[1];

  const supabaseService = getServiceSupabase();
  const { data: { user }, error: userError } = await supabaseService.auth.getUser(token);

  if (userError || !user) {
    await logUserAction({
      action: 'ACCOUNT_DELETION_ATTEMPT',
      status: 'FAILURE',
      ipAddress: request.ip,
      userAgent: request.headers.get('user-agent'),
      targetResourceType: 'user',
      details: { reason: userError?.message || 'Invalid token' }
    });
    return NextResponse.json({ error: userError?.message || 'Invalid token' }, { status: 401 });
  }

  console.log(`Account deletion requested for user: ${user.id}`);

  // 2. Password Confirmation (Recommended for real implementation)
  // In a real app, you'd likely require the user to re-enter their password here.
  // const { password } = await request.json();
  // const { error: signInError } = await supabaseService.auth.signInWithPassword({ email: user.email, password });
  // if (signInError) {
  //   return NextResponse.json({ error: 'Invalid password' }, { status: 403 });
  // }

  try {
    const gdprService = getApiGDPRService();
    const result = await gdprService.deleteAccount(user.id);

    if (!result.success) {
      throw new Error(result.error || 'Deletion failed');
    }

    await logUserAction({
      userId: user.id,
      action: 'ACCOUNT_DELETION_INITIATED',
      status: 'SUCCESS',
      ipAddress: request.ip,
      userAgent: request.headers.get('user-agent'),
      targetResourceType: 'user',
      targetResourceId: user.id
    });

    return NextResponse.json({ message: result.message || 'Account deletion process initiated successfully.' });

  } catch (error) {
    console.error(`Error during mock account deletion for user ${user.id}:`, error);
    await logUserAction({
      userId: user?.id,
      action: 'ACCOUNT_DELETION_ERROR',
      status: 'FAILURE',
      ipAddress: request.ip,
      userAgent: request.headers.get('user-agent'),
      targetResourceType: 'user',
      targetResourceId: user?.id,
      details: { error: error instanceof Error ? error.message : String(error) }
    });
    return NextResponse.json({ error: 'Failed to process account deletion request.' }, { status: 500 });
  }
} 