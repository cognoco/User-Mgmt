import { NextRequest } from 'next/server';
import { z } from 'zod';
import { withSecurity } from '@/middleware/with-security';
import { getApiAuthService } from '@/services/auth/factory';
import { createSuccessResponse, ApiError, ERROR_CODES } from '@/lib/api/common';
import {
  createMiddlewareChain,
  errorHandlingMiddleware,
  validationMiddleware,
  rateLimitMiddleware
} from '@/middleware/createMiddlewareChain';

const DisableSchema = z.object({ code: z.string().min(4) });

async function handleDisable(req: NextRequest, data: z.infer<typeof DisableSchema>) {
  const authService = getApiAuthService();
  const result = await authService.disableMFA(data.code);
  if (!result.success) {
    throw new ApiError(ERROR_CODES.INVALID_REQUEST, result.error || 'MFA disable failed', 400);
  }
  return createSuccessResponse(result);
}

const middleware = createMiddlewareChain([
  rateLimitMiddleware({ windowMs: 15 * 60 * 1000, max: 30 }),
  errorHandlingMiddleware(),
  validationMiddleware(DisableSchema)
]);

export const POST = withSecurity((request: NextRequest) =>
  middleware(handleDisable)(request)
);
