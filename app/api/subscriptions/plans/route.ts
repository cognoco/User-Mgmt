import { createApiHandler, emptySchema } from '@/lib/api/route-helpers';
import {
  createSuccessResponse,
  ApiError,
  ERROR_CODES,
} from '@/lib/api/common';
import { checkRateLimit } from '@/middleware/rate-limit';

/**
 * Public endpoint to list available subscription plans.
 */
export const GET = createApiHandler(
  emptySchema,
  async (req: any, authContext: any, data: any, services: any) => {
    const isRateLimited = await checkRateLimit(req);
    if (isRateLimited) {
      throw new ApiError(ERROR_CODES.INVALID_REQUEST, 'Too many requests', 429);
    }
    const plans = await services.subscription.getAvailablePlans();
    return createSuccessResponse({ plans });
  },
  {
    requireAuth: false, // Plans might be public
  }
);
