import { createApiHandler, emptySchema } from '@/lib/api/routeHelpers'0;
import { createSuccessResponse, ApiError, ERROR_CODES } from '@/lib/api/common';

/**
 * POST handler for MFA enable endpoint
 */
export const POST = createApiHandler(
  emptySchema,
  async (_request, _authContext, _data, services) => {
    const result = await services.auth.setupMFA();
    
    if (!result.success) {
      throw new ApiError(ERROR_CODES.INVALID_REQUEST, result.error || 'MFA setup failed', 400);
    }
    
    return createSuccessResponse(result);
  },
  { 
    requireAuth: true, // MFA enable requires authentication
    rateLimit: { windowMs: 15 * 60 * 1000, max: 5 }
  }
);
