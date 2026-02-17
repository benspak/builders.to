import Stripe from "stripe";
import { getStripe } from "./stripe";
import { prisma } from "./prisma";

/**
 * Stripe Subscription utilities for Pro Membership
 *
 * This module handles:
 * - Pro membership subscription checkout
 * - Subscription management (cancel, reactivate)
 * - Monthly token grants
 */

// Pro subscription pricing
export const PRO_MONTHLY_PRICE_CENTS = 399; // $3.99
export const PRO_YEARLY_PRICE_CENTS = 3999; // $39.99

// Get price IDs from environment
export function getProPriceId(plan: "MONTHLY" | "YEARLY"): string {
  if (plan === "MONTHLY") {
    const priceId = process.env.STRIPE_PRO_MONTHLY_PRICE_ID;
    if (!priceId) {
      throw new Error("STRIPE_PRO_MONTHLY_PRICE_ID is not configured");
    }
    return priceId;
  } else {
    const priceId = process.env.STRIPE_PRO_YEARLY_PRICE_ID;
    if (!priceId) {
      throw new Error("STRIPE_PRO_YEARLY_PRICE_ID is not configured");
    }
    return priceId;
  }
}

/**
 * Create a Stripe Checkout session for Pro subscription
 */
export async function createProCheckoutSession(
  userId: string,
  email: string,
  plan: "MONTHLY" | "YEARLY",
  returnUrl: string
): Promise<{ sessionId: string; url: string }> {
  const stripe = getStripe();
  const priceId = getProPriceId(plan);

  // Check if user already has a Stripe customer ID
  const existingSubscription = await prisma.proSubscription.findUnique({
    where: { userId },
    select: { stripeCustomerId: true },
  });

  const sessionParams: Stripe.Checkout.SessionCreateParams = {
    mode: "subscription",
    payment_method_types: ["card"],
    line_items: [
      {
        price: priceId,
        quantity: 1,
      },
    ],
    success_url: `${returnUrl}?success=true&session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${returnUrl}?cancelled=true`,
    metadata: {
      type: "pro_subscription",
      userId,
      plan,
    },
    subscription_data: {
      metadata: {
        type: "pro_subscription",
        userId,
        plan,
      },
    },
  };

  // Use existing customer if available
  if (existingSubscription?.stripeCustomerId) {
    sessionParams.customer = existingSubscription.stripeCustomerId;
  } else {
    sessionParams.customer_email = email;
  }

  const session = await stripe.checkout.sessions.create(sessionParams);

  return {
    sessionId: session.id,
    url: session.url!,
  };
}

/**
 * Cancel a Pro subscription at the end of the billing period
 */
export async function cancelProSubscription(userId: string): Promise<boolean> {
  const stripe = getStripe();

  const subscription = await prisma.proSubscription.findUnique({
    where: { userId },
    select: { stripeSubscriptionId: true },
  });

  if (!subscription?.stripeSubscriptionId) {
    return false;
  }

  try {
    await stripe.subscriptions.update(subscription.stripeSubscriptionId, {
      cancel_at_period_end: true,
    });

    await prisma.proSubscription.update({
      where: { userId },
      data: { cancelAtPeriodEnd: true },
    });

    return true;
  } catch (error) {
    console.error("[Pro Subscription] Failed to cancel:", error);
    return false;
  }
}

/**
 * Reactivate a cancelled Pro subscription (before period end)
 */
export async function reactivateProSubscription(userId: string): Promise<boolean> {
  const stripe = getStripe();

  const subscription = await prisma.proSubscription.findUnique({
    where: { userId },
    select: { stripeSubscriptionId: true, cancelAtPeriodEnd: true },
  });

  if (!subscription?.stripeSubscriptionId || !subscription.cancelAtPeriodEnd) {
    return false;
  }

  try {
    await stripe.subscriptions.update(subscription.stripeSubscriptionId, {
      cancel_at_period_end: false,
    });

    await prisma.proSubscription.update({
      where: { userId },
      data: { cancelAtPeriodEnd: false },
    });

    return true;
  } catch (error) {
    console.error("[Pro Subscription] Failed to reactivate:", error);
    return false;
  }
}

/**
 * Get the current Pro subscription status for a user
 */
export async function getProSubscriptionStatus(userId: string): Promise<{
  isActive: boolean;
  isPro: boolean;
  plan: "MONTHLY" | "YEARLY" | null;
  status: "INACTIVE" | "ACTIVE" | "PAST_DUE" | "CANCELLED";
  currentPeriodEnd: Date | null;
  cancelAtPeriodEnd: boolean;
} | null> {
  const subscription = await prisma.proSubscription.findUnique({
    where: { userId },
    select: {
      status: true,
      plan: true,
      currentPeriodEnd: true,
      cancelAtPeriodEnd: true,
    },
  });

  if (!subscription) {
    return null;
  }

  return {
    isActive: subscription.status === "ACTIVE",
    isPro: subscription.status === "ACTIVE",
    plan: subscription.plan,
    status: subscription.status,
    currentPeriodEnd: subscription.currentPeriodEnd,
    cancelAtPeriodEnd: subscription.cancelAtPeriodEnd,
  };
}

/**
 * Validate that a Date object is valid
 */
function isValidDate(date: Date | null | undefined): date is Date {
  return date instanceof Date && !isNaN(date.getTime());
}

/**
 * Activate a Pro subscription after successful checkout
 */
export async function activateProSubscription(
  userId: string,
  stripeCustomerId: string,
  stripeSubscriptionId: string,
  stripePriceId: string,
  plan: "MONTHLY" | "YEARLY",
  currentPeriodStart: Date,
  currentPeriodEnd: Date
): Promise<void> {
  // Validate dates - use defaults if invalid
  const validPeriodStart = isValidDate(currentPeriodStart) ? currentPeriodStart : new Date();
  const validPeriodEnd = isValidDate(currentPeriodEnd) 
    ? currentPeriodEnd 
    : new Date(Date.now() + (plan === "YEARLY" ? 365 : 30) * 24 * 60 * 60 * 1000);

  console.log(`[Pro Subscription] Activating for user ${userId}`);
  console.log(`[Pro Subscription] Period: ${validPeriodStart.toISOString()} - ${validPeriodEnd.toISOString()}`);

  await prisma.proSubscription.upsert({
    where: { userId },
    create: {
      userId,
      stripeCustomerId,
      stripeSubscriptionId,
      stripePriceId,
      status: "ACTIVE",
      plan,
      currentPeriodStart: validPeriodStart,
      currentPeriodEnd: validPeriodEnd,
      cancelAtPeriodEnd: false,
    },
    update: {
      stripeCustomerId,
      stripeSubscriptionId,
      stripePriceId,
      status: "ACTIVE",
      plan,
      currentPeriodStart: validPeriodStart,
      currentPeriodEnd: validPeriodEnd,
      cancelAtPeriodEnd: false,
    },
  });

  console.log(`[Pro Subscription] Activated for user ${userId}`);
}

/**
 * Update subscription status from webhook
 */
export async function updateProSubscriptionStatus(
  stripeSubscriptionId: string,
  status: "ACTIVE" | "PAST_DUE" | "CANCELLED" | "INACTIVE",
  currentPeriodStart?: Date,
  currentPeriodEnd?: Date,
  cancelAtPeriodEnd?: boolean
): Promise<void> {
  const updateData: {
    status: "ACTIVE" | "PAST_DUE" | "CANCELLED" | "INACTIVE";
    currentPeriodStart?: Date;
    currentPeriodEnd?: Date;
    cancelAtPeriodEnd?: boolean;
  } = { status };

  if (currentPeriodStart) updateData.currentPeriodStart = currentPeriodStart;
  if (currentPeriodEnd) updateData.currentPeriodEnd = currentPeriodEnd;
  if (cancelAtPeriodEnd !== undefined) updateData.cancelAtPeriodEnd = cancelAtPeriodEnd;

  await prisma.proSubscription.update({
    where: { stripeSubscriptionId },
    data: updateData,
  });

  console.log(`[Pro Subscription] Updated status to ${status} for subscription ${stripeSubscriptionId}`);
}

/**
 * Get Stripe Customer Portal URL for managing subscription
 */
export async function getCustomerPortalUrl(
  userId: string,
  returnUrl: string
): Promise<string | null> {
  const stripe = getStripe();

  const subscription = await prisma.proSubscription.findUnique({
    where: { userId },
    select: { stripeCustomerId: true },
  });

  if (!subscription?.stripeCustomerId) {
    return null;
  }

  try {
    const session = await stripe.billingPortal.sessions.create({
      customer: subscription.stripeCustomerId,
      return_url: returnUrl,
    });

    return session.url;
  } catch (error) {
    console.error("[Pro Subscription] Failed to create portal session:", error);
    return null;
  }
}

/**
 * Check if a user has an active Pro subscription
 */
export async function isProMember(userId: string): Promise<boolean> {
  const subscription = await prisma.proSubscription.findUnique({
    where: { userId },
    select: { status: true },
  });

  return subscription?.status === "ACTIVE";
}

/**
 * Safely extract period dates from a Stripe subscription object.
 * Handles both old API versions (current_period_start/end on subscription)
 * and Stripe SDK v20+ where these fields were removed.
 */
function getSubscriptionPeriodDates(sub: Record<string, unknown>): {
  periodStart: Date | undefined;
  periodEnd: Date | undefined;
} {
  // Try current_period_start/end (present in older API versions)
  const rawStart = sub.current_period_start as number | undefined;
  const rawEnd = sub.current_period_end as number | undefined;

  const periodStart = typeof rawStart === "number" && rawStart > 0
    ? new Date(rawStart * 1000)
    : undefined;
  const periodEnd = typeof rawEnd === "number" && rawEnd > 0
    ? new Date(rawEnd * 1000)
    : undefined;

  return { periodStart, periodEnd };
}

/**
 * Extract the subscription ID from a Stripe invoice.
 * Handles both old API (invoice.subscription) and Stripe SDK v20+
 * (invoice.parent.subscription_details.subscription).
 */
export function getSubscriptionIdFromInvoice(invoice: Record<string, unknown>): string | null {
  // Try old format: invoice.subscription (string or object with id)
  const directSub = invoice.subscription;
  if (typeof directSub === "string" && directSub.startsWith("sub_")) {
    return directSub;
  }
  if (directSub && typeof directSub === "object" && "id" in (directSub as Record<string, unknown>)) {
    return (directSub as Record<string, unknown>).id as string;
  }

  // Try new format: invoice.parent.subscription_details.subscription
  const parent = invoice.parent as Record<string, unknown> | undefined;
  if (parent) {
    const subDetails = parent.subscription_details as Record<string, unknown> | undefined;
    if (subDetails) {
      const sub = subDetails.subscription;
      if (typeof sub === "string" && sub.startsWith("sub_")) {
        return sub;
      }
      if (sub && typeof sub === "object" && "id" in (sub as Record<string, unknown>)) {
        return (sub as Record<string, unknown>).id as string;
      }
    }
  }

  return null;
}

/**
 * Verify and sync Pro subscription status with Stripe.
 * 
 * This is a self-healing mechanism for cases where webhook delivery failed
 * or events were missed. It checks Stripe's actual subscription data and
 * updates the local database if out of sync.
 * 
 * Only calls Stripe API when the local status is NOT active, to minimize
 * API calls for happy-path users.
 * 
 * @returns The corrected subscription status, or null if no subscription found
 */
export async function verifyAndSyncProStatus(
  userId: string,
  userEmail?: string | null
): Promise<{
  synced: boolean;
  status: "ACTIVE" | "PAST_DUE" | "CANCELLED" | "INACTIVE";
} | null> {
  console.log(`[Pro Sync] Starting sync for user ${userId}, email: ${userEmail || "none"}`);

  let stripe: ReturnType<typeof getStripe>;
  try {
    stripe = getStripe();
  } catch (error) {
    console.error("[Pro Sync] Failed to initialize Stripe client:", error);
    return null;
  }

  // First, check if we have a local subscription record
  const localSub = await prisma.proSubscription.findUnique({
    where: { userId },
    select: {
      status: true,
      stripeSubscriptionId: true,
      stripeCustomerId: true,
    },
  });

  console.log(`[Pro Sync] Local subscription: ${localSub ? `status=${localSub.status}, subId=${localSub.stripeSubscriptionId}, custId=${localSub.stripeCustomerId}` : "none"}`);

  // If local record shows ACTIVE, trust it (webhooks would handle any changes)
  if (localSub?.status === "ACTIVE") {
    console.log("[Pro Sync] Local status is ACTIVE, no sync needed");
    return { synced: false, status: "ACTIVE" };
  }

  // Strategy 1: Verify by existing Stripe subscription ID
  if (localSub?.stripeSubscriptionId) {
    console.log(`[Pro Sync] Strategy 1: Retrieving subscription ${localSub.stripeSubscriptionId}`);
    try {
      const stripeSub = await stripe.subscriptions.retrieve(localSub.stripeSubscriptionId);
      const stripeStatus = stripeSub.status;
      console.log(`[Pro Sync] Strategy 1: Stripe subscription status = "${stripeStatus}"`);

      if (stripeStatus === "active" || stripeStatus === "trialing") {
        const { periodStart, periodEnd } = getSubscriptionPeriodDates(stripeSub as unknown as Record<string, unknown>);
        console.log(`[Pro Sync] Strategy 1: Period start=${periodStart?.toISOString() || "unknown"}, end=${periodEnd?.toISOString() || "unknown"}`);

        await prisma.proSubscription.update({
          where: { userId },
          data: {
            status: "ACTIVE",
            ...(periodStart && { currentPeriodStart: periodStart }),
            ...(periodEnd && { currentPeriodEnd: periodEnd }),
            cancelAtPeriodEnd: stripeSub.cancel_at_period_end,
          },
        });

        console.log(`[Pro Sync] Strategy 1 SUCCESS: Synced to ACTIVE for user ${userId}`);
        return { synced: true, status: "ACTIVE" };
      } else {
        console.log(`[Pro Sync] Strategy 1: Stripe status "${stripeStatus}" is not active, skipping`);
      }
    } catch (error) {
      console.error(`[Pro Sync] Strategy 1 FAILED for subscription ${localSub.stripeSubscriptionId}:`, error instanceof Error ? error.message : error);
    }
  }

  // Strategy 2: Search by Stripe customer ID
  if (localSub?.stripeCustomerId) {
    console.log(`[Pro Sync] Strategy 2: Listing active subscriptions for customer ${localSub.stripeCustomerId}`);
    try {
      const subs = await stripe.subscriptions.list({
        customer: localSub.stripeCustomerId,
        status: "active",
        limit: 5,
      });

      console.log(`[Pro Sync] Strategy 2: Found ${subs.data.length} active subscription(s)`);

      if (subs.data.length > 0) {
        const activeSub = subs.data[0];
        const { periodStart, periodEnd } = getSubscriptionPeriodDates(activeSub as unknown as Record<string, unknown>);

        const monthlyPriceId = process.env.STRIPE_PRO_MONTHLY_PRICE_ID;
        const priceId = activeSub.items.data[0]?.price?.id;
        const plan = priceId === monthlyPriceId ? "MONTHLY" : "YEARLY";

        console.log(`[Pro Sync] Strategy 2: Syncing sub ${activeSub.id}, plan=${plan}, priceId=${priceId}`);

        await prisma.proSubscription.update({
          where: { userId },
          data: {
            status: "ACTIVE",
            stripeSubscriptionId: activeSub.id,
            stripePriceId: priceId,
            plan: plan as "MONTHLY" | "YEARLY",
            ...(periodStart && { currentPeriodStart: periodStart }),
            ...(periodEnd && { currentPeriodEnd: periodEnd }),
            cancelAtPeriodEnd: activeSub.cancel_at_period_end,
          },
        });

        console.log(`[Pro Sync] Strategy 2 SUCCESS: Synced via customer ID for user ${userId}`);
        return { synced: true, status: "ACTIVE" };
      }
    } catch (error) {
      console.error(`[Pro Sync] Strategy 2 FAILED for customer ${localSub.stripeCustomerId}:`, error instanceof Error ? error.message : error);
    }
  }

  // Strategy 3: Search by email (catches cases where no local record exists or customer ID changed)
  if (userEmail) {
    console.log(`[Pro Sync] Strategy 3: Searching customers by email ${userEmail}`);
    try {
      const customers = await stripe.customers.list({
        email: userEmail,
        limit: 5,
      });

      console.log(`[Pro Sync] Strategy 3: Found ${customers.data.length} customer(s) for email ${userEmail}`);

      for (const customer of customers.data) {
        console.log(`[Pro Sync] Strategy 3: Checking customer ${customer.id}`);
        const subs = await stripe.subscriptions.list({
          customer: customer.id,
          status: "active",
          limit: 5,
        });

        console.log(`[Pro Sync] Strategy 3: Customer ${customer.id} has ${subs.data.length} active subscription(s)`);

        for (const activeSub of subs.data) {
          const monthlyPriceId = process.env.STRIPE_PRO_MONTHLY_PRICE_ID;
          const yearlyPriceId = process.env.STRIPE_PRO_YEARLY_PRICE_ID;
          const priceId = activeSub.items.data[0]?.price?.id;
          const isProPrice = priceId === monthlyPriceId || priceId === yearlyPriceId;
          const isProMetadata = activeSub.metadata?.type === "pro_subscription";

          console.log(`[Pro Sync] Strategy 3: Sub ${activeSub.id} priceId=${priceId}, isProPrice=${isProPrice}, isProMetadata=${isProMetadata}, monthlyPriceId=${monthlyPriceId}, yearlyPriceId=${yearlyPriceId}`);

          if (isProPrice || isProMetadata) {
            const { periodStart, periodEnd } = getSubscriptionPeriodDates(activeSub as unknown as Record<string, unknown>);
            const plan = priceId === monthlyPriceId ? "MONTHLY" : "YEARLY";

            await prisma.proSubscription.upsert({
              where: { userId },
              create: {
                userId,
                stripeCustomerId: customer.id,
                stripeSubscriptionId: activeSub.id,
                stripePriceId: priceId,
                status: "ACTIVE",
                plan: plan as "MONTHLY" | "YEARLY",
                currentPeriodStart: periodStart,
                currentPeriodEnd: periodEnd,
                cancelAtPeriodEnd: activeSub.cancel_at_period_end,
              },
              update: {
                stripeCustomerId: customer.id,
                stripeSubscriptionId: activeSub.id,
                stripePriceId: priceId,
                status: "ACTIVE",
                plan: plan as "MONTHLY" | "YEARLY",
                ...(periodStart && { currentPeriodStart: periodStart }),
                ...(periodEnd && { currentPeriodEnd: periodEnd }),
                cancelAtPeriodEnd: activeSub.cancel_at_period_end,
              },
            });

            console.log(`[Pro Sync] Strategy 3 SUCCESS: Synced via email for user ${userId}, sub ${activeSub.id}`);
            return { synced: true, status: "ACTIVE" };
          }
        }
      }

      console.log(`[Pro Sync] Strategy 3: No matching Pro subscription found for email ${userEmail}`);
    } catch (error) {
      console.error(`[Pro Sync] Strategy 3 FAILED for email ${userEmail}:`, error instanceof Error ? error.message : error);
    }
  }

  console.log(`[Pro Sync] All strategies exhausted for user ${userId}. No active Pro subscription found in Stripe.`);
  return localSub ? { synced: false, status: localSub.status as "ACTIVE" | "PAST_DUE" | "CANCELLED" | "INACTIVE" } : null;
}
