import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/payments/stripe";
import { getApiSubscriptionService } from "@/services/subscription/factory";
import type Stripe from "stripe";

/**
 * Stripe Webhook handler
 *
 * Verifies the event signature and updates subscriptions accordingly.
 */
export async function POST(request: NextRequest) {
  const signature = request.headers.get("stripe-signature");
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!webhookSecret) {
    console.error("STRIPE_WEBHOOK_SECRET not configured");
    return NextResponse.json(
      { error: "Server configuration error" },
      { status: 500 },
    );
  }

  const payload = await request.text();
  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(
      payload,
      signature || "",
      webhookSecret,
    );
  } catch (err) {
    console.error("Stripe signature verification failed:", err);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  try {
    switch (event.type) {
      case "customer.subscription.created":
      case "customer.subscription.updated":
      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription;
        const userId = subscription.metadata?.user_id;
        if (userId) {
          const service = getApiSubscriptionService();
          if (service) {
            await service.reconcileSubscription({
              id: subscription.id,
              userId,
              planId: subscription.items.data[0]?.price.id ?? "",
              status: subscription.status,
              startDate: new Date(subscription.start_date * 1000).toISOString(),
              endDate: subscription.ended_at
                ? new Date(subscription.ended_at * 1000).toISOString()
                : null,
              renewalDate: new Date(
                subscription.current_period_end * 1000,
              ).toISOString(),
              canceledAt: subscription.canceled_at
                ? new Date(subscription.canceled_at * 1000).toISOString()
                : null,
              paymentMethod: undefined,
              metadata: subscription.metadata as any,
            });
          }
        }
        break;
      }
      default:
        console.log(`Unhandled Stripe event: ${event.type}`);
    }
  } catch (err) {
    console.error("Error processing Stripe webhook:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }

  return NextResponse.json({ received: true });
}
