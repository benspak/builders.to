import { NextResponse } from "next/server";
import Stripe from "stripe";
import { getStripe } from "@/lib/stripe";
import {
  activateProSubscription,
  updateProSubscriptionStatus,
  getSubscriptionIdFromInvoice,
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
 * Safely extract period dates from a Stripe subscription object.
 * Compatible with both old Stripe API (current_period_start/end on subscription)
 * and Stripe SDK v20+ where these fields were removed from the type.
 * The raw webhook payload may still include them depending on the account's API version.
 */
function getSubscriptionPeriodDates(sub: Record<string, unknown>): {
  periodStart: Date | null;
  periodEnd: Date | null;
} {
  const rawStart = sub.current_period_start as number | undefined;
  const rawEnd = sub.current_period_end as number | undefined;

  return {
    periodStart: getDateFromStripeTimestamp(rawStart),
    periodEnd: getDateFromStripeTimestamp(rawEnd),
  };
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

        // Extract period dates - compatible with both old and new Stripe API versions
        // In SDK v20+ / newer API versions, current_period_start/end may not be on the type
        const subRaw = subscription as unknown as Record<string, unknown>;
        const { periodStart, periodEnd } = getSubscriptionPeriodDates(subRaw);

        console.log(`[Pro Webhook] Period start: ${periodStart?.toISOString() ?? "unavailable"}`);
        console.log(`[Pro Webhook] Period end: ${periodEnd?.toISOString() ?? "unavailable"}`);

        await activateProSubscription(
          userId,
          session.customer as string,
          subscriptionId,
          subscription.items.data[0].price.id,
          plan,
          periodStart || new Date(),
          periodEnd || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
        );

        console.log(`[Pro Webhook] Activated Pro subscription for user ${userId}`);
        break;
      }

      case "invoice.paid": {
        const invoice = event.data.object as Stripe.Invoice;

        // Extract subscription ID - compatible with both old and new Stripe API
        const invoiceRaw = invoice as unknown as Record<string, unknown>;
        const invoiceSubId = getSubscriptionIdFromInvoice(invoiceRaw);

        if (!invoiceSubId) {
          console.log("[Pro Webhook] invoice.paid: No subscription ID found, skipping");
          break;
        }

        console.log(`[Pro Webhook] invoice.paid: subscription ID = ${invoiceSubId}`);
        const stripe = getStripe();
        const subscription = await stripe.subscriptions.retrieve(invoiceSubId);

        // Only handle Pro subscriptions
        if (subscription.metadata?.type !== "pro_subscription") {
          console.log("[Pro Webhook] invoice.paid: Not a Pro subscription, skipping");
          break;
        }

        const userId = subscription.metadata.userId;
        if (!userId) {
          console.error("[Pro Webhook] Missing userId in subscription metadata");
          break;
        }

        // Extract period dates from subscription - Stripe v20 compatible
        const subRawInvoice = subscription as unknown as Record<string, unknown>;
        const { periodStart: invoicePeriodStart, periodEnd: invoicePeriodEnd } = getSubscriptionPeriodDates(subRawInvoice);

        // Also try invoice period dates as fallback (available in all Stripe versions)
        const finalPeriodStart = invoicePeriodStart || getDateFromStripeTimestamp(invoice.period_start);
        const finalPeriodEnd = invoicePeriodEnd || getDateFromStripeTimestamp(invoice.period_end);

        await updateProSubscriptionStatus(
          invoiceSubId,
          "ACTIVE",
          finalPeriodStart || undefined,
          finalPeriodEnd || undefined,
          undefined,
          userId
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
        // Stripe statuses: incomplete, incomplete_expired, trialing, active, past_due, canceled, unpaid, paused
        let status: "ACTIVE" | "PAST_DUE" | "CANCELLED" | "INACTIVE";
        switch (subscription.status) {
          case "active":
          case "trialing":
            // Trialing users should have full Pro access
            status = "ACTIVE";
            break;
          case "past_due":
          case "incomplete":
            // Keep access during payment retry period
            status = "PAST_DUE";
            break;
          case "canceled":
          case "unpaid":
            status = "CANCELLED";
            break;
          case "incomplete_expired":
          case "paused":
          default:
            status = "INACTIVE";
            console.log(`[Pro Webhook] Mapped Stripe status "${subscription.status}" to INACTIVE for subscription ${subscription.id}`);
        }

        // Extract period dates - Stripe v20 compatible
        const subRawUpdate = subscription as unknown as Record<string, unknown>;
        const { periodStart: updatePeriodStart, periodEnd: updatePeriodEnd } = getSubscriptionPeriodDates(subRawUpdate);

        const subUserId = subscription.metadata?.userId;

        await updateProSubscriptionStatus(
          subscription.id,
          status,
          updatePeriodStart || undefined,
          updatePeriodEnd || undefined,
          subscription.cancel_at_period_end,
          subUserId || undefined
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

        const deletedSubUserId = subscription.metadata?.userId;

        await updateProSubscriptionStatus(
          subscription.id,
          "CANCELLED",
          undefined,
          undefined,
          false, // Reset cancelAtPeriodEnd since the subscription is now fully cancelled
          deletedSubUserId || undefined
        );

        console.log(`[Pro Webhook] Subscription cancelled: ${subscription.id}`);
        break;
      }

      case "invoice.payment_failed": {
        const invoice = event.data.object as Stripe.Invoice;

        // Extract subscription ID - compatible with both old and new Stripe API
        const failedInvoiceRaw = invoice as unknown as Record<string, unknown>;
        const failedSubId = getSubscriptionIdFromInvoice(failedInvoiceRaw);

        if (!failedSubId) {
          console.log("[Pro Webhook] invoice.payment_failed: No subscription ID found, skipping");
          break;
        }

        console.log(`[Pro Webhook] invoice.payment_failed: subscription ID = ${failedSubId}`);
        const stripe = getStripe();
        const subscription = await stripe.subscriptions.retrieve(failedSubId);

        // Only handle Pro subscriptions
        if (subscription.metadata?.type !== "pro_subscription") {
          console.log("[Pro Webhook] invoice.payment_failed: Not a Pro subscription, skipping");
          break;
        }

        const failedUserId = subscription.metadata?.userId;

        await updateProSubscriptionStatus(
          failedSubId,
          "PAST_DUE",
          undefined,
          undefined,
          undefined,
          failedUserId || undefined
        );

        console.log(`[Pro Webhook] Payment failed for subscription: ${failedSubId}`);
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
