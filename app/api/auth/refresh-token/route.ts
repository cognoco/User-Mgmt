import { type NextRequest } from 'next/server';
import { withAuthRateLimit } from '@/middleware/with-auth-rate-limit';
import { withSecurity } from '@/middleware/with-security';
import { getApiAuthService } from '@/services/auth/factory';
import { getCurrentSession } from '@/lib/auth/session';
import { logUserAction } from '@/lib/audit/auditLogger';
import { createSuccessResponse } from '@/lib/api/common';
import { withErrorHandling } from '@/middleware/error-handling';

const failedRefreshAttempts: Record<string, { count: number; last: number }> = {};

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
    const key = ipAddress;
    delete failedRefreshAttempts[key];
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
    const key = ipAddress;
    const entry = failedRefreshAttempts[key] || { count: 0, last: Date.now() };
    if (Date.now() - entry.last > 5 * 60 * 1000) {
      entry.count = 0;
    }
    entry.count += 1;
    entry.last = Date.now();
    failedRefreshAttempts[key] = entry;
    if (entry.count >= 5) {
      await logUserAction({
        action: 'TOKEN_REFRESH_SUSPICIOUS',
        status: 'FAILURE',
        ipAddress,
        userAgent,
        targetResourceType: 'auth',
        targetResourceId: 'current',
        details: { attempts: entry.count },
      });
    }
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
