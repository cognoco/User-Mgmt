import { z } from 'zod';
import { createApiHandler } from '@/lib/api/routeHelpers';
import { createSuccessResponse, ApiError, ERROR_CODES } from '@/lib/api/common';

const DisableSchema = z.object({ code: z.string().min(4) });

/**
 * POST handler for MFA disable endpoint
 */
export const POST = createApiHandler(
  DisableSchema,
  async (_request, _authContext, data, services) => {
    const result = await services.auth.disableMFA(data.code);
    
    if (!result.success) {
      throw new ApiError(ERROR_CODES.INVALID_REQUEST, result.error || 'MFA disable failed', 400);
    }
    
    return createSuccessResponse(result);
  },
  { 
    requireAuth: true, // MFA disable requires authentication
    rateLimit: { windowMs: 15 * 60 * 1000, max: 5 }
  }
);
