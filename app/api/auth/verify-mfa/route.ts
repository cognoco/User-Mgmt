import { z } from 'zod';
import { createApiHandler } from '@/lib/api/route-helpers';
import { logUserAction } from '@/lib/audit/auditLogger';
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
    const ipAddress = request.headers.get('x-forwarded-for') || 'unknown';
    const userAgent = request.headers.get('user-agent') || 'unknown';
    
    const result = await services.auth.verifyMFA(data.code);

    await logUserAction({
      userId: authContext.userId,
      action: 'MFA_VERIFY',
      status: result.success ? 'SUCCESS' : 'FAILURE',
      ipAddress,
      userAgent,
      targetResourceType: 'auth',
      targetResourceId: authContext.userId
    });

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
