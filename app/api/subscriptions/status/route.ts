import { NextRequest } from 'next/server';
import { createApiHandler, emptySchema } from '@/lib/api/route-helpers';
import {
  createSuccessResponse,
  ApiError,
  ERROR_CODES,
} from '@/lib/api/common';
import { checkRateLimit } from '@/middleware/rate-limit';
import { logUserAction } from '@/lib/audit/auditLogger';

/**
 * Retrieve the current user's subscription status.
 */
export const GET = createApiHandler(
  emptySchema,
  async (req: NextRequest, authContext: any, data: any, services: any) => {
    const isRateLimited = await checkRateLimit(req);
    if (isRateLimited) {
      throw new ApiError(ERROR_CODES.INVALID_REQUEST, 'Too many requests', 429);
    }
    const subscription = await services.subscription.getUserSubscription(authContext.userId);
    await logUserAction({
      userId: authContext.userId,
      action: 'SUBSCRIPTION_STATUS_VIEWED',
      status: 'SUCCESS',
      ipAddress: req.headers.get('x-forwarded-for') || 'unknown',
      userAgent: req.headers.get('user-agent') || 'unknown',
      targetResourceType: 'subscription',
    });
    return createSuccessResponse({ subscription: subscription ?? null });
  },
  {
    requireAuth: true,
  }
);
