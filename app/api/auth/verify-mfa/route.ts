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

const VerifyMfaSchema = z.object({ code: z.string().min(4) });

async function handleVerifyMfa(
  req: NextRequest,
  data: z.infer<typeof VerifyMfaSchema>
) {
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

async function handler(req: NextRequest) {
  return withErrorHandling(
    async (r) => withValidation(VerifyMfaSchema, handleVerifyMfa, r),
    req
  );
}

export const POST = withSecurity(async (request: NextRequest) =>
  withAuthRateLimit(request, handler)
);
