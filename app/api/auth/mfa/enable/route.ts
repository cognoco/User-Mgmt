import { NextRequest } from 'next/server';
import { withSecurity } from '@/middleware/with-security';
import { getApiAuthService } from '@/services/auth/factory';
import { createSuccessResponse, ApiError, ERROR_CODES } from '@/lib/api/common';
import {
  createMiddlewareChain,
  errorHandlingMiddleware,
  rateLimitMiddleware
} from '@/middleware/createMiddlewareChain';

async function handleEnableMfa(_req: NextRequest) {
  const authService = getApiAuthService();
  const result = await authService.setupMFA();
  if (!result.success) {
    throw new ApiError(ERROR_CODES.INVALID_REQUEST, result.error || 'MFA setup failed', 400);
  }
  return createSuccessResponse(result);
}

const middleware = createMiddlewareChain([
  rateLimitMiddleware({ windowMs: 15 * 60 * 1000, max: 30 }),
  errorHandlingMiddleware()
]);

export const POST = withSecurity((request: NextRequest) =>
  middleware(handleEnableMfa)(request)
);
