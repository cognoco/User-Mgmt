import { NextRequest } from 'next/server';
import { z } from 'zod';
import { createCheckoutSession } from '@/lib/payments/stripe';
import {
  createSuccessResponse,
  createValidationError,
  createServerError,
} from '@/lib/api/common';

const bodySchema = z.object({ plan: z.string() });

/**
 * Create a Stripe checkout session for a subscription plan.
 */
export async function POST(req: NextRequest) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    throw createValidationError('Invalid JSON');
  }
  const parse = bodySchema.safeParse(body);
  if (!parse.success) {
    throw createValidationError('Invalid payload', parse.error.flatten());
  }

  try {
    const session = await createCheckoutSession({
      mode: 'subscription',
      line_items: [{ price: parse.data.plan, quantity: 1 }],
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/billing/success`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/billing/cancel`,
    });
    return createSuccessResponse({ url: session.url });
  } catch (err: any) {
    throw createServerError(err.message);
  }
}
