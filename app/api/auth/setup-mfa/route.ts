import { type NextRequest } from 'next/server';
import { withAuthRateLimit } from '@/middleware/with-auth-rate-limit';
import { withSecurity } from '@/middleware/with-security';
import { getApiAuthService } from '@/services/auth/factory';
import { logUserAction } from '@/lib/audit/auditLogger';
import {
  createSuccessResponse,
  withErrorHandling,
  ApiError,
  ERROR_CODES
} from '@/lib/api/common';

async function handleSetupMfa(req: NextRequest) {
  const ipAddress = req.headers.get('x-forwarded-for') || 'unknown';
  const userAgent = req.headers.get('user-agent') || 'unknown';
  const authService = getApiAuthService();
  const result = await authService.setupMFA();

  await logUserAction({
    action: 'MFA_SETUP',
    status: result.success ? 'SUCCESS' : 'FAILURE',
    ipAddress,
    userAgent,
    targetResourceType: 'auth'
  });

  if (!result.success) {
    throw new ApiError(
      ERROR_CODES.INVALID_REQUEST,
      result.error || 'MFA setup failed',
      400
    );
  }

  return createSuccessResponse(result);
}

async function handler(req: NextRequest) {
  return withErrorHandling(handleSetupMfa, req);
}

export const POST = withSecurity(async (request: NextRequest) =>
  withAuthRateLimit(request, handler)
);
