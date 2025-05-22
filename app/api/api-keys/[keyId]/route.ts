import { NextRequest, NextResponse } from 'next/server';
import { checkRateLimit } from '@/middleware/rate-limit';
import { logUserAction } from '@/lib/audit/auditLogger';
import { getCurrentUser } from '@/lib/auth/session';
import { createSupabaseApiKeyProvider } from '@/adapters/api-keys/factory';

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

    const provider = createSupabaseApiKeyProvider({
      supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL!,
      supabaseKey: process.env.SUPABASE_SERVICE_ROLE_KEY!
    });

    const revokeResult = await provider.revokeKey(user.id, keyId);

    if (!revokeResult.success) {
      console.error('Error revoking API key:', revokeResult.error);
      return NextResponse.json({ error: revokeResult.error || 'Failed to revoke API key' }, { status: 500 });
    }

    const keyData = revokeResult.key;

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