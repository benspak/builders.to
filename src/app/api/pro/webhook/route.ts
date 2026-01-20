import { NextResponse } from "next/server";
import Stripe from "stripe";
import { getStripe } from "@/lib/stripe";
import {
  activateProSubscription,
  updateProSubscriptionStatus,
} from "@/lib/stripe-subscription";

// Route segment config for webhook handling
// Use nodejs runtime and disable body size limit for webhook payloads
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 30; // 30 seconds timeout for webhook processing

/**
 * Helper to safely convert Stripe timestamps to Date objects
 * Stripe timestamps are Unix timestamps (seconds since epoch)
 * Handles undefined, null, and various numeric formats
 */
function getDateFromStripeTimestamp(timestamp: number | null | undefined): Date | null {
  if (timestamp === null || timestamp === undefined) {
    return null;
  }
  
  // Stripe timestamps are in seconds, not milliseconds
  const ms = typeof timestamp === "number" ? timestamp * 1000 : null;
  
  if (ms === null || isNaN(ms)) {
    console.error(`[Pro Webhook] Invalid timestamp: ${timestamp}`);
    return null;
  }
  
  const date = new Date(ms);
  
  // Validate the date is reasonable (between year 2020 and 2100)
  if (date.getFullYear() < 2020 || date.getFullYear() > 2100) {
    console.error(`[Pro Webhook] Timestamp out of range: ${timestamp} -> ${date.toISOString()}`);
    return null;
  }
  
  return date;
}

/**
 * POST /api/pro/webhook
 * Handle Stripe webhook events for Pro subscriptions
 */
export async function POST(request: Request) {
  let body: string;
  
  try {
    body = await request.text();
  } catch (err) {
    console.error("[Pro Webhook] Failed to read request body:", err);
    return NextResponse.json(
      { error: "Failed to read request body" },
      { status: 400 }
    );
  }

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
    console.error(`[Pro Webhook] Signature: ${signature?.substring(0, 50)}...`);
    console.error(`[Pro Webhook] Body length: ${body.length}`);
    return NextResponse.json(
      { error: `Webhook signature verification failed: ${errorMessage}` },
      { status: 400 }
    );
  }

  console.log(`[Pro Webhook] Received event: ${event.type}`);
  console.log(`[Pro Webhook] Event ID: ${event.id}`);

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;

        console.log(`[Pro Webhook] Checkout session metadata: ${JSON.stringify(session.metadata)}`);
        console.log(`[Pro Webhook] Session mode: ${session.mode}`);
        console.log(`[Pro Webhook] Session subscription: ${session.subscription}`);

        // Only handle Pro subscription checkouts
        if (session.metadata?.type !== "pro_subscription") {
          console.log("[Pro Webhook] Not a Pro subscription checkout, skipping");
          console.log(`[Pro Webhook] metadata.type = "${session.metadata?.type}"`);
          break;
        }

        const userId = session.metadata.userId;
        const plan = session.metadata.plan as "MONTHLY" | "YEARLY";

        if (!userId || !plan) {
          console.error("[Pro Webhook] Missing userId or plan in metadata");
          console.error(`[Pro Webhook] userId: ${userId}, plan: ${plan}`);
          break;
        }

        // Get subscription details
        const stripe = getStripe();
        const subscriptionId = session.subscription as string;
        
        if (!subscriptionId) {
          console.error("[Pro Webhook] No subscription ID in session");
          break;
        }

        console.log(`[Pro Webhook] Retrieving subscription: ${subscriptionId}`);
        const subscription = await stripe.subscriptions.retrieve(subscriptionId);
        console.log(`[Pro Webhook] Subscription status: ${subscription.status}`);
        console.log(`[Pro Webhook] Subscription raw data:`, JSON.stringify({
          current_period_start: subscription.current_period_start,
          current_period_end: subscription.current_period_end,
        }));

        // Handle period dates - they can be numbers (unix timestamps) or undefined
        // In newer Stripe API versions, these are always numbers (seconds since epoch)
        const periodStart = getDateFromStripeTimestamp(subscription.current_period_start);
        const periodEnd = getDateFromStripeTimestamp(subscription.current_period_end);

        console.log(`[Pro Webhook] Period start: ${periodStart?.toISOString()}`);
        console.log(`[Pro Webhook] Period end: ${periodEnd?.toISOString()}`);

        await activateProSubscription(
          userId,
          session.customer as string,
          subscriptionId,
          subscription.items.data[0].price.id,
          plan,
          periodStart || new Date(),
          periodEnd || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // Default to 30 days from now
        );

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

        // Update period dates with safe timestamp conversion
        const invoicePeriodStart = getDateFromStripeTimestamp(subscription.current_period_start);
        const invoicePeriodEnd = getDateFromStripeTimestamp(subscription.current_period_end);

        await updateProSubscriptionStatus(
          invoice.subscription as string,
          "ACTIVE",
          invoicePeriodStart || undefined,
          invoicePeriodEnd || undefined
        );

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

        const updatePeriodStart = getDateFromStripeTimestamp(subscription.current_period_start);
        const updatePeriodEnd = getDateFromStripeTimestamp(subscription.current_period_end);

        await updateProSubscriptionStatus(
          subscription.id,
          status,
          updatePeriodStart || undefined,
          updatePeriodEnd || undefined,
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
    console.error("[Pro Webhook] Event type:", event.type);
    console.error("[Pro Webhook] Event ID:", event.id);
    if (error instanceof Error) {
      console.error("[Pro Webhook] Error message:", error.message);
      console.error("[Pro Webhook] Error stack:", error.stack);
    }
    return NextResponse.json(
      { error: "Webhook handler failed", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}
