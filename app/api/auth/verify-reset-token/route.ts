import { type NextRequest } from 'next/server';
import { z } from 'zod';
import { withAuthRateLimit } from '@/middleware/with-auth-rate-limit';
import { withSecurity } from '@/middleware/with-security';
import { getApiAuthService } from '@/services/auth/factory';
import {
  createSuccessResponse,
  withErrorHandling,
  withValidation,
  ApiError,
  ERROR_CODES,
} from '@/lib/api/common';

const VerifySchema = z.object({ token: z.string().min(1) });

async function handleVerify(req: NextRequest, data: z.infer<typeof VerifySchema>) {
  const authService = getApiAuthService();
  const result = await authService.verifyPasswordResetToken(data.token);
  if (!result.valid) {
    throw new ApiError(ERROR_CODES.INVALID_REQUEST, result.error || 'Invalid or expired token', 400);
  }
  return createSuccessResponse({ message: 'Token valid' });
}

async function handler(request: NextRequest) {
  return withErrorHandling(
    async (req) => withValidation(VerifySchema, handleVerify, req),
    request,
  );
}

export const POST = withSecurity(async (request: NextRequest) =>
  withAuthRateLimit(request, handler),
);
