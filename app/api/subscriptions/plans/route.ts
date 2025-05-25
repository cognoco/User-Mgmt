import { NextResponse } from 'next/server';
import { getApiSubscriptionService } from '@/services/subscription/factory';

/**
 * Public endpoint to list available subscription plans.
 */
export async function GET() {
  const service = getApiSubscriptionService();
  const plans = await service.getPlans();
  return NextResponse.json(plans);
}
