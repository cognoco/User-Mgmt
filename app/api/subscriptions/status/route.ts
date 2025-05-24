import { NextRequest, NextResponse } from 'next/server';
import { getApiSubscriptionService } from '@/services/subscription/factory';

/**
 * Retrieve the current user's subscription status.
 */
export async function GET(req: NextRequest) {
  const userId = req.headers.get('x-user-id');
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const service = getApiSubscriptionService();
  const subscription = await service.getUserSubscription(userId);
  return NextResponse.json(subscription ?? null);
}
