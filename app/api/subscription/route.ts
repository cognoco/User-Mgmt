import { stripe, createCustomer, createSubscription } from '@/lib/payments/stripe';
import { getServiceSupabase } from '@/adapters/database/supabase-provider';
import { z } from 'zod';
import { NextResponse } from 'next/server';

const SubscriptionSchema = z.object({ plan: z.string() });

export async function GET(request: Request) {
  // Assume auth header is present and valid
  const supabase = getServiceSupabase();
  const authHeader = request.headers.get('authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
  }
  const token = authHeader.split(' ')[1];
  const { data: { user }, error: userError } = await supabase.auth.getUser(token);
  if (userError || !user) {
    return NextResponse.json({ error: userError?.message || 'Invalid token' }, { status: 401 });
  }
  // Fetch subscription from DB
  const { data: subscription, error: subError } = await supabase
    .from('subscriptions')
    .select('*')
    .eq('user_id', user.id)
    .maybeSingle();
  if (subError) {
    return NextResponse.json({ error: 'Failed to fetch subscription' }, { status: 500 });
  }
  if (!subscription) {
    return NextResponse.json({ subscription: null });
  }
  // Optionally fetch from Stripe for up-to-date status
  let stripeSub = null;
  if (subscription.stripe_subscription_id) {
    try {
      stripeSub = await stripe.subscriptions.retrieve(subscription.stripe_subscription_id);
    } catch (e) {
      // Ignore if not found
    }
  }
  return NextResponse.json({ subscription, stripe: stripeSub });
}

export async function POST(request: Request) {
  const supabase = getServiceSupabase();
  const authHeader = request.headers.get('authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
  }
  const token = authHeader.split(' ')[1];
  const { data: { user }, error: userError } = await supabase.auth.getUser(token);
  if (userError || !user) {
    return NextResponse.json({ error: userError?.message || 'Invalid token' }, { status: 401 });
  }
  const body = await request.json();
  const parse = SubscriptionSchema.safeParse(body);
  if (!parse.success) {
    return NextResponse.json({ error: 'Invalid input' }, { status: 400 });
  }
  // Check if user already has a Stripe customer
  let customerId = null;
  const { data: existingSub } = await supabase
    .from('subscriptions')
    .select('customer_id')
    .eq('user_id', user.id)
    .maybeSingle();
  if (existingSub && existingSub.customer_id) {
    customerId = existingSub.customer_id;
  } else {
    // Create Stripe customer
    const customer = await createCustomer({
      email: user.email,
      metadata: { user_id: user.id },
    });
    customerId = customer.id;
  }
  // Create Stripe subscription
  // You must map plan to a Stripe price ID
  const priceId = parse.data.plan; // In production, validate this is a real price ID
  let stripeSub;
  try {
    stripeSub = await createSubscription({
      customer: customerId,
      items: [{ price: priceId }],
      payment_behavior: 'default_incomplete',
      expand: ['latest_invoice.payment_intent'],
    });
  } catch (e: any) {
    return NextResponse.json({ error: e.message || 'Stripe error' }, { status: 400 });
  }
  // Upsert subscription in DB
  await supabase.from('subscriptions').upsert({
    user_id: user.id,
    customer_id: customerId,
    stripe_subscription_id: stripeSub.id,
    plan: priceId,
    status: stripeSub.status,
    current_period_end: stripeSub.current_period_end ? new Date(stripeSub.current_period_end * 1000).toISOString() : null,
    cancel_at_period_end: stripeSub.cancel_at_period_end,
    trial_end: stripeSub.trial_end ? new Date(stripeSub.trial_end * 1000).toISOString() : null,
    updated_at: new Date().toISOString(),
  });
  return NextResponse.json({ success: true, subscription: stripeSub });
} 