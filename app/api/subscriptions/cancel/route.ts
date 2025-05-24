import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getApiSubscriptionService } from '@/services/subscription/factory';

const bodySchema = z.object({
  subscriptionId: z.string(),
  immediate: z.boolean().optional(),
});

/**
 * Cancel a user's subscription.
 */
export async function POST(req: NextRequest) {
  const userId = req.headers.get('x-user-id');
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const parse = bodySchema.safeParse(body);
  if (!parse.success) {
    return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });
  }

  const service = getApiSubscriptionService();
  const result = await service.cancelSubscription(
    parse.data.subscriptionId,
    parse.data.immediate
  );

  if (!result.success) {
    return NextResponse.json({ error: result.error || 'Failed to cancel' }, { status: 400 });
  }
  return NextResponse.json({ success: true });
}
