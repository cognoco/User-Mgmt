import { type NextRequest } from 'next/server';
import { z } from 'zod';
import { withSecurity } from '@/middleware/with-security';
import { getApiAuthService } from '@/services/auth/factory';
import { logUserAction } from '@/lib/audit/auditLogger';
import {
  createSuccessResponse,
  ApiError,
  ERROR_CODES
} from '@/lib/api/common';
import {
  createMiddlewareChain,
  errorHandlingMiddleware,
  validationMiddleware,
  rateLimitMiddleware
} from '@/middleware/createMiddlewareChain';

const VerifyMfaSchema = z.object({ code: z.string().min(4) });

async function handleVerifyMfa(
  req: NextRequest,
  ctx?: any,
  data?: z.infer<typeof VerifyMfaSchema>
) {
  if (!data) {
    throw new ApiError(
      ERROR_CODES.INVALID_REQUEST,
      'Invalid or missing request data',
      400
    );
  }

  const ipAddress = req.headers.get('x-forwarded-for') || 'unknown';
  const userAgent = req.headers.get('user-agent') || 'unknown';
  const authService = getApiAuthService();
  const result = await authService.verifyMFA(data.code);

  await logUserAction({
    action: 'MFA_VERIFY',
    status: result.success ? 'SUCCESS' : 'FAILURE',
    ipAddress,
    userAgent,
    targetResourceType: 'auth'
  });

  if (!result.success) {
    throw new ApiError(
      ERROR_CODES.INVALID_REQUEST,
      result.error || 'MFA verification failed',
      400
    );
  }

  return createSuccessResponse(result);
}

const middleware = createMiddlewareChain([
  rateLimitMiddleware({ windowMs: 15 * 60 * 1000, max: 10 }),
  errorHandlingMiddleware(),
  validationMiddleware(VerifyMfaSchema)
]);

export const POST = withSecurity((request: NextRequest) =>
  middleware(handleVerifyMfa)(request)
);
