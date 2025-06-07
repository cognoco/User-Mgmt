import { z } from 'zod';
import { createApiHandler } from '@/lib/api/routeHelpers';
import {
  createSuccessResponse,
  ApiError,
  ERROR_CODES
} from '@/lib/api/common';

const VerifyMfaSchema = z.object({ code: z.string().min(4) });

/**
 * POST handler for MFA verification endpoint
 */
export const POST = createApiHandler(
  VerifyMfaSchema,
  async (request, authContext, data, services) => {
    // Extract request context for the service
    const context = {
      ipAddress: request.headers.get('x-forwarded-for') || 'unknown',
      userAgent: request.headers.get('user-agent') || 'unknown',
    };
    
    // Call auth service with context - all business logic including audit logging is now in the service
    const result = await services.auth.verifyMFA(data.code, context);

    if (!result.success) {
      throw new ApiError(
        ERROR_CODES.INVALID_REQUEST,
        result.error || 'MFA verification failed',
        400
      );
    }

    return createSuccessResponse(result);
  },
  { 
    requireAuth: false, // MFA verification might not have full auth yet
    rateLimit: { windowMs: 15 * 60 * 1000, max: 10 }
  }
);
