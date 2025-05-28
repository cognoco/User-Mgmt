import { NextRequest } from 'next/server';
import { z } from 'zod';
import { createBillingPortalSession } from '@/lib/payments/stripe';
import {
  createSuccessResponse,
  createValidationError,
  createServerError,
} from '@/lib/api/common';

const bodySchema = z.object({ customerId: z.string() });

/**
 * Create a Stripe billing portal session for the given customer.
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
    const session = await createBillingPortalSession({
      customer: parse.data.customerId,
      return_url: `${process.env.NEXT_PUBLIC_APP_URL}/billing`,
    });
    return createSuccessResponse({ url: session.url });
  } catch (err: any) {
    throw createServerError(err.message);
  }
}
