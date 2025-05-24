import { NextRequest } from 'next/server';
import { z } from 'zod';
import { withAuthRateLimit } from '@/middleware/with-auth-rate-limit';
import { withSecurity } from '@/middleware/with-security';
import { getApiAuthService } from '@/services/auth/factory';
import { createSuccessResponse, withErrorHandling, withValidation, ApiError, ERROR_CODES } from '@/lib/api/common';

const DisableSchema = z.object({ code: z.string().min(4) });

async function handleDisable(req: NextRequest, data: z.infer<typeof DisableSchema>) {
  const authService = getApiAuthService();
  const result = await authService.disableMFA(data.code);
  if (!result.success) {
    throw new ApiError(ERROR_CODES.INVALID_REQUEST, result.error || 'MFA disable failed', 400);
  }
  return createSuccessResponse(result);
}

async function handler(req: NextRequest) {
  return withErrorHandling(async r => withValidation(DisableSchema, handleDisable, r), req);
}

export const POST = withSecurity(async (request: NextRequest) =>
  withAuthRateLimit(request, handler)
);
