import { type NextRequest } from 'next/server';
import { withAuthRateLimit } from '@/middleware/with-auth-rate-limit';
import { withSecurity } from '@/middleware/with-security';
import { getApiAuthService } from '@/services/auth/factory';
import { getCurrentSession } from '@/lib/auth/session';
import { logUserAction } from '@/lib/audit/auditLogger';
import { createSuccessResponse } from '@/lib/api/common';
import { withErrorHandling } from '@/middleware/error-handling';

async function handleRefreshToken(req: NextRequest) {
  const ipAddress = req.headers.get('x-forwarded-for') || 'unknown';
  const userAgent = req.headers.get('user-agent') || 'unknown';
  const authService = getApiAuthService();
  const success = await authService.refreshToken();
  let session = null;
  if (success) {
    try {
      session = await getCurrentSession();
    } catch {
      session = null;
    }
  }

  await logUserAction({
    action: 'TOKEN_REFRESH',
    status: success ? 'SUCCESS' : 'FAILURE',
    ipAddress,
    userAgent,
    targetResourceType: 'auth',
    targetResourceId: 'current'
  });

  if (!success) {
    return Response.redirect(new URL('/login', req.url));
  }

  return createSuccessResponse({ success: true, expiresAt: session?.expiresAt });
}

async function handler(req: NextRequest) {
  return withErrorHandling(handleRefreshToken, req);
}

export const POST = withSecurity(async (request: NextRequest) =>
  withAuthRateLimit(request, handler)
);
