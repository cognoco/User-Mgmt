import { type NextRequest } from 'next/server';
import { z } from 'zod';
import { withAuthRateLimit } from '@/middleware/with-auth-rate-limit';
import { withSecurity } from '@/middleware/with-security';
import { getApiAuthService } from '@/services/auth/factory';
import { logUserAction } from '@/lib/audit/auditLogger';
import {
  createSuccessResponse,
  withErrorHandling,
  withValidation,
  ApiError,
  ERROR_CODES
} from '@/lib/api/common';

const VerifyEmailSchema = z.object({ token: z.string().min(1) });

async function handleVerifyEmail(
  req: NextRequest,
  data: z.infer<typeof VerifyEmailSchema>
) {
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

async function handler(req: NextRequest) {
  return withErrorHandling(
    async (r) => withValidation(VerifyEmailSchema, handleVerifyEmail, r),
    req
  );
}

export const POST = withSecurity(async (request: NextRequest) =>
  withAuthRateLimit(request, handler)
);
