import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { createBillingPortalSession } from '@/lib/payments/stripe';

const bodySchema = z.object({ customerId: z.string() });

/**
 * Create a Stripe billing portal session for the given customer.
 */
export async function POST(req: NextRequest) {
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

  try {
    const session = await createBillingPortalSession({
      customer: parse.data.customerId,
      return_url: `${process.env.NEXT_PUBLIC_APP_URL}/billing`,
    });
    return NextResponse.json({ url: session.url });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
