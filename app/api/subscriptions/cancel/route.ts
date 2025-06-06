import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { createApiHandler } from '@/lib/api/route-helpers';
import {
  createSuccessResponse,
  ApiError,
  ERROR_CODES,
} from '@/lib/api/common';
import { checkRateLimit } from '@/middleware/rate-limit';
import { logUserAction } from '@/lib/audit/auditLogger';

const bodySchema = z.object({
  subscriptionId: z.string(),
  immediate: z.boolean().optional(),
});

/**
 * Cancel a user's subscription.
 */
export const POST = createApiHandler(
  bodySchema,
  async (req: NextRequest, authContext: any, data: z.infer<typeof bodySchema>, services: any) => {
    const isRateLimited = await checkRateLimit(req);
    if (isRateLimited) {
      throw new ApiError(ERROR_CODES.INVALID_REQUEST, 'Too many requests', 429);
    }

    const result = await services.subscription.cancelSubscription(
      data.subscriptionId,
      data.immediate
    );

    if (!result.success) {
      return NextResponse.json({ error: result.error || 'Failed to cancel' }, { status: 400 });
    }
    await logUserAction({
      userId: authContext.userId,
      action: 'SUBSCRIPTION_CANCELLED',
      status: 'SUCCESS',
      ipAddress: req.headers.get('x-forwarded-for') || 'unknown',
      userAgent: req.headers.get('user-agent') || 'unknown',
      targetResourceType: 'subscription',
      targetResourceId: data.subscriptionId,
    });
    return createSuccessResponse({ success: true });
  },
  {
    requireAuth: true,
  }
);
