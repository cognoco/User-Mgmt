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

const VerifyEmailSchema = z.object({ token: z.string().min(1) });

async function handleVerifyEmail(
  req: NextRequest,
  ctx?: any,
  data?: z.infer<typeof VerifyEmailSchema>
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
  try {
    const authService = getApiAuthService();
    await authService.verifyEmail(data.token);
    await logUserAction({
      action: 'EMAIL_VERIFIED',
      status: 'SUCCESS',
      ipAddress,
      userAgent,
      targetResourceType: 'auth'
    });
    return createSuccessResponse({ message: 'Email verified successfully' });
  } catch (error) {
    await logUserAction({
      action: 'EMAIL_VERIFICATION_FAILED',
      status: 'FAILURE',
      ipAddress,
      userAgent,
      targetResourceType: 'auth',
      details: { error: error instanceof Error ? error.message : String(error) }
    });
    throw new ApiError(
      ERROR_CODES.INTERNAL_ERROR,
      error instanceof Error ? error.message : 'Verification failed',
      500
    );
  }
}

const middleware = createMiddlewareChain([
  rateLimitMiddleware({ windowMs: 15 * 60 * 1000, max: 30 }),
  errorHandlingMiddleware(),
  validationMiddleware(VerifyEmailSchema)
]);

export const POST = withSecurity((request: NextRequest) =>
  middleware(handleVerifyEmail)(request)
);
