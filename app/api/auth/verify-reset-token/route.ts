import { type NextRequest } from 'next/server';
import { z } from 'zod';
import { withSecurity } from '@/middleware/with-security';
import { getApiAuthService } from '@/services/auth/factory';
import {
  createSuccessResponse,
  ApiError,
  ERROR_CODES,
} from '@/lib/api/common';
import {
  createMiddlewareChain,
  errorHandlingMiddleware,
  validationMiddleware,
  rateLimitMiddleware
} from '@/middleware/createMiddlewareChain';

const VerifySchema = z.object({ token: z.string().min(1) });

async function handleVerify(
  req: NextRequest,
  ctx?: any,
  data?: z.infer<typeof VerifySchema>
) {
  if (!data) {
    throw new ApiError(
      ERROR_CODES.INVALID_REQUEST,
      'Invalid or missing request data',
      400
    );
  }

  const authService = getApiAuthService();
  const result = await authService.verifyPasswordResetToken(data.token);
  if (!result.valid) {
    throw new ApiError(ERROR_CODES.INVALID_REQUEST, result.error || 'Invalid or expired token', 400);
  }
  return createSuccessResponse({ message: 'Token valid' });
}

const middleware = createMiddlewareChain([
  rateLimitMiddleware({ windowMs: 15 * 60 * 1000, max: 10 }),
  errorHandlingMiddleware(),
  validationMiddleware(VerifySchema)
]);

export const POST = withSecurity((request: NextRequest) =>
  middleware(handleVerify)(request)
);
