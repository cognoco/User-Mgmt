import { z } from 'zod';
import { createApiHandler } from '@/lib/api/routeHelpers'26;
import {
  createSuccessResponse,
  ApiError,
  ERROR_CODES,
} from '@/lib/api/common';

const VerifySchema = z.object({ token: z.string().min(1) });

/**
 * POST handler for verifying password reset token endpoint
 */
export const POST = createApiHandler(
  VerifySchema,
  async (_request, _authContext, data, services) => {
    const result = await services.auth.verifyPasswordResetToken(data.token);
    
    if (!result.valid) {
      throw new ApiError(ERROR_CODES.INVALID_REQUEST, result.error || 'Invalid or expired token', 400);
    }
    
    return createSuccessResponse({ message: 'Token valid' });
  },
  { 
    requireAuth: false, // Token verification doesn't require auth
    rateLimit: { windowMs: 15 * 60 * 1000, max: 10 }
  }
);
