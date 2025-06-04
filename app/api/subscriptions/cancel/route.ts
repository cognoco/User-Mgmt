import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { createApiHandler } from '@/lib/api/route-helpers';
import { createSuccessResponse } from '@/lib/api/common';

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
    const result = await services.subscription.cancelSubscription(
      data.subscriptionId,
      data.immediate
    );

    if (!result.success) {
      return NextResponse.json({ error: result.error || 'Failed to cancel' }, { status: 400 });
    }
    return createSuccessResponse({ success: true });
  },
  {
    requireAuth: true,
  }
);
