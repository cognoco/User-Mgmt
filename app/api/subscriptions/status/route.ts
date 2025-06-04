import { NextRequest } from 'next/server';
import { createApiHandler, emptySchema } from '@/lib/api/route-helpers';
import { createSuccessResponse } from '@/lib/api/common';

/**
 * Retrieve the current user's subscription status.
 */
export const GET = createApiHandler(
  emptySchema,
  async (req: NextRequest, authContext: any, data: any, services: any) => {
    const subscription = await services.subscription.getUserSubscription(authContext.userId);
    return createSuccessResponse({ subscription: subscription ?? null });
  },
  {
    requireAuth: true,
  }
);
