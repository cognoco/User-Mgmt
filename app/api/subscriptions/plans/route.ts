import { createApiHandler, emptySchema } from '@/lib/api/route-helpers';
import { createSuccessResponse } from '@/lib/api/common';

/**
 * Public endpoint to list available subscription plans.
 */
export const GET = createApiHandler(
  emptySchema,
  async (req: any, authContext: any, data: any, services: any) => {
    const plans = await services.subscription.getAvailablePlans();
    return createSuccessResponse({ plans });
  },
  {
    requireAuth: false, // Plans might be public
  }
);
