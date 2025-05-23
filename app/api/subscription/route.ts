import { stripe, createCustomer, createSubscription } from '@/lib/payments/stripe';
import { getServiceSupabase } from '@/lib/database/supabase';
import { SupabaseSubscriptionProvider } from '@/adapters/subscription/supabase/supabase-subscription.provider';
import { z } from 'zod';
import { NextResponse } from 'next/server';

const SubscriptionSchema = z.object({ plan: z.string() });

export async function GET(request: Request) {
  // Assume auth header is present and valid
  const supabase = getServiceSupabase();
  const provider = new SupabaseSubscriptionProvider(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
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
  const subscription = await provider.getUserSubscription(user.id);
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
  const provider = new SupabaseSubscriptionProvider(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
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
  const existing = await provider.getUserSubscription(user.id);
  if (existing && (existing as any).customer_id) {
    customerId = (existing as any).customer_id;
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
  await provider.upsertSubscription({
    userId: user.id,
    planId: priceId,
    id: existing?.id,
    status: stripeSub.status,
    startDate: new Date().toISOString(),
  });
  return NextResponse.json({ success: true, subscription: stripeSub });
} 