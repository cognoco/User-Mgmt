import { NextRequest } from 'next/server';
import { withAuthRateLimit } from '@/middleware/with-auth-rate-limit';
import { withSecurity } from '@/middleware/with-security';
import { getApiAuthService } from '@/services/auth/factory';
import { createSuccessResponse, withErrorHandling, ApiError, ERROR_CODES } from '@/lib/api/common';

async function handleEnableMfa(_req: NextRequest) {
  const authService = getApiAuthService();
  const result = await authService.setupMFA();
  if (!result.success) {
    throw new ApiError(ERROR_CODES.INVALID_REQUEST, result.error || 'MFA setup failed', 400);
  }
  return createSuccessResponse(result);
}

async function handler(req: NextRequest) {
  return withErrorHandling(handleEnableMfa, req);
}

export const POST = withSecurity(async (request: NextRequest) =>
  withAuthRateLimit(request, handler)
);
