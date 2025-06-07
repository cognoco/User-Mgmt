import { createApiHandler, emptySchema } from '@/lib/api/routeHelpers';
import { logUserAction } from '@/lib/audit/auditLogger';
import {
  createSuccessResponse,
  ApiError,
  ERROR_CODES
} from '@/lib/api/common';

/**
 * POST handler for MFA setup endpoint
 */
export const POST = createApiHandler(
  emptySchema,
  async (request, authContext, _data, services) => {
    const ipAddress = request.headers.get('x-forwarded-for') || 'unknown';
    const userAgent = request.headers.get('user-agent') || 'unknown';
    
    const result = await services.auth.setupMFA();

    await logUserAction({
      userId: authContext.userId,
      action: 'MFA_SETUP',
      status: result.success ? 'SUCCESS' : 'FAILURE',
      ipAddress,
      userAgent,
      targetResourceType: 'auth',
      targetResourceId: authContext.userId
    });

    if (!result.success) {
      throw new ApiError(
        ERROR_CODES.INVALID_REQUEST,
        result.error || 'MFA setup failed',
        400
      );
    }

    return createSuccessResponse(result);
  },
  { 
    requireAuth: true, // MFA setup requires authentication
    rateLimit: { windowMs: 15 * 60 * 1000, max: 5 } // Conservative rate limiting for MFA setup
  }
);
