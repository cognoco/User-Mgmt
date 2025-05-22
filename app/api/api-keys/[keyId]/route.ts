import { NextRequest, NextResponse } from 'next/server';
import { getServiceSupabase } from '@/adapters/database/supabase-provider';
import { checkRateLimit } from '@/middleware/rate-limit';
import { logUserAction } from '@/lib/audit/auditLogger';
import { getCurrentUser } from '@/lib/auth/session';

// DELETE handler to revoke an API key
export async function DELETE(
  request: NextRequest,
  { params }: { params: { keyId: string } }
) {
  // Get IP and User Agent
  const ipAddress = request.headers.get('x-forwarded-for') || 'unknown';
  const userAgent = request.headers.get('user-agent') || 'unknown';

  // Rate limiting
  const isRateLimited = await checkRateLimit(request);
  if (isRateLimited) {
    return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
  }

  try {
    // Extract key ID from URL
    const { keyId } = params;

    // Get current user
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get Supabase instance
    const supabase = getServiceSupabase();

    // First, verify that the API key belongs to the user
    const { data: keyData, error: fetchError } = await supabase
      .from('api_keys')
      .select('id, name, prefix')
      .eq('id', keyId)
      .eq('user_id', user.id)
      .single();

    if (fetchError || !keyData) {
      console.error('Error fetching API key or key not found:', fetchError);
      return NextResponse.json({ error: 'API key not found' }, { status: 404 });
    }

    // Soft delete (revoke) the API key
    const { error: updateError } = await supabase
      .from('api_keys')
      .update({
        is_revoked: true,
        updated_at: new Date().toISOString()
      })
      .eq('id', keyId)
      .eq('user_id', user.id);

    if (updateError) {
      console.error('Error revoking API key:', updateError);
      return NextResponse.json({ error: 'Failed to revoke API key' }, { status: 500 });
    }

    // Log the action
    await logUserAction({
      userId: user.id,
      action: 'API_KEY_REVOKED',
      status: 'SUCCESS',
      ipAddress,
      userAgent,
      targetResourceType: 'api_key',
      targetResourceId: keyId,
      details: { 
        name: keyData.name, 
        prefix: keyData.prefix 
      }
    });

    return NextResponse.json({ message: 'API key revoked successfully' });
  } catch (error) {
    console.error('Unexpected error in API key DELETE:', error);
    return NextResponse.json({ error: 'An internal server error occurred' }, { status: 500 });
  }
} 