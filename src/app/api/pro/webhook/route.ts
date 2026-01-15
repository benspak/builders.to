import { NextResponse } from "next/server";
import Stripe from "stripe";
import { getStripe } from "@/lib/stripe";
import {
  activateProSubscription,
  updateProSubscriptionStatus,
  grantProTokens,
} from "@/lib/stripe-subscription";

/**
 * POST /api/pro/webhook
 * Handle Stripe webhook events for Pro subscriptions
 */
export async function POST(request: Request) {
  const body = await request.text();
  const signature = request.headers.get("stripe-signature");

  if (!signature) {
    console.error("[Pro Webhook] Missing stripe-signature header");
    return NextResponse.json(
      { error: "Missing stripe-signature header" },
      { status: 400 }
    );
  }

  const webhookSecret = process.env.STRIPE_PRO_WEBHOOK_SECRET;
  if (!webhookSecret) {
    console.error("[Pro Webhook] STRIPE_PRO_WEBHOOK_SECRET not configured");
    return NextResponse.json(
      { error: "Webhook secret not configured" },
      { status: 500 }
    );
  }

  let event: Stripe.Event;

  try {
    const stripe = getStripe();
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : "Unknown error";
    console.error(`[Pro Webhook] Signature verification failed: ${errorMessage}`);
    return NextResponse.json(
      { error: `Webhook signature verification failed: ${errorMessage}` },
      { status: 400 }
    );
  }

  console.log(`[Pro Webhook] Received event: ${event.type}`);

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;

        // Only handle Pro subscription checkouts
        if (session.metadata?.type !== "pro_subscription") {
          console.log("[Pro Webhook] Not a Pro subscription checkout, skipping");
          break;
        }

        const userId = session.metadata.userId;
        const plan = session.metadata.plan as "MONTHLY" | "YEARLY";

        if (!userId || !plan) {
          console.error("[Pro Webhook] Missing userId or plan in metadata");
          break;
        }

        // Get subscription details
        const stripe = getStripe();
        const subscriptionId = session.subscription as string;
        const subscription = await stripe.subscriptions.retrieve(subscriptionId);

        await activateProSubscription(
          userId,
          session.customer as string,
          subscriptionId,
          subscription.items.data[0].price.id,
          plan,
          new Date(subscription.current_period_start * 1000),
          new Date(subscription.current_period_end * 1000)
        );

        // Grant initial tokens
        await grantProTokens(userId);

        console.log(`[Pro Webhook] Activated Pro subscription for user ${userId}`);
        break;
      }

      case "invoice.paid": {
        const invoice = event.data.object as Stripe.Invoice;

        // Get subscription to check if it's a Pro subscription
        if (!invoice.subscription) {
          break;
        }

        const stripe = getStripe();
        const subscription = await stripe.subscriptions.retrieve(
          invoice.subscription as string
        );

        // Only handle Pro subscriptions
        if (subscription.metadata?.type !== "pro_subscription") {
          break;
        }

        const userId = subscription.metadata.userId;
        if (!userId) {
          console.error("[Pro Webhook] Missing userId in subscription metadata");
          break;
        }

        // Update period dates
        await updateProSubscriptionStatus(
          invoice.subscription as string,
          "ACTIVE",
          new Date(subscription.current_period_start * 1000),
          new Date(subscription.current_period_end * 1000)
        );

        // Grant monthly tokens (handles duplicate prevention internally)
        await grantProTokens(userId);

        console.log(`[Pro Webhook] Invoice paid for user ${userId}`);
        break;
      }

      case "customer.subscription.updated": {
        const subscription = event.data.object as Stripe.Subscription;

        // Only handle Pro subscriptions
        if (subscription.metadata?.type !== "pro_subscription") {
          break;
        }

        // Map Stripe status to our status
        let status: "ACTIVE" | "PAST_DUE" | "CANCELLED" | "INACTIVE";
        switch (subscription.status) {
          case "active":
            status = "ACTIVE";
            break;
          case "past_due":
            status = "PAST_DUE";
            break;
          case "canceled":
          case "unpaid":
            status = "CANCELLED";
            break;
          default:
            status = "INACTIVE";
        }

        await updateProSubscriptionStatus(
          subscription.id,
          status,
          new Date(subscription.current_period_start * 1000),
          new Date(subscription.current_period_end * 1000),
          subscription.cancel_at_period_end
        );

        console.log(`[Pro Webhook] Subscription updated: ${subscription.id} -> ${status}`);
        break;
      }

      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription;

        // Only handle Pro subscriptions
        if (subscription.metadata?.type !== "pro_subscription") {
          break;
        }

        await updateProSubscriptionStatus(
          subscription.id,
          "CANCELLED"
        );

        console.log(`[Pro Webhook] Subscription cancelled: ${subscription.id}`);
        break;
      }

      case "invoice.payment_failed": {
        const invoice = event.data.object as Stripe.Invoice;

        if (!invoice.subscription) {
          break;
        }

        const stripe = getStripe();
        const subscription = await stripe.subscriptions.retrieve(
          invoice.subscription as string
        );

        // Only handle Pro subscriptions
        if (subscription.metadata?.type !== "pro_subscription") {
          break;
        }

        await updateProSubscriptionStatus(
          invoice.subscription as string,
          "PAST_DUE"
        );

        console.log(`[Pro Webhook] Payment failed for subscription: ${invoice.subscription}`);
        break;
      }

      default:
        console.log(`[Pro Webhook] Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("[Pro Webhook] Error processing event:", error);
    return NextResponse.json(
      { error: "Webhook handler failed" },
      { status: 500 }
    );
  }
}
