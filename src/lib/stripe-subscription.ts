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
  const stripe = getStripe();

  // First, check if we have a local subscription record
  const localSub = await prisma.proSubscription.findUnique({
    where: { userId },
    select: {
      status: true,
      stripeSubscriptionId: true,
      stripeCustomerId: true,
    },
  });

  // If local record shows ACTIVE, trust it (webhooks would handle any changes)
  if (localSub?.status === "ACTIVE") {
    return { synced: false, status: "ACTIVE" };
  }

  // Strategy 1: Verify by existing Stripe subscription ID
  if (localSub?.stripeSubscriptionId) {
    try {
      const stripeSub = await stripe.subscriptions.retrieve(localSub.stripeSubscriptionId);
      if (stripeSub.status === "active" || stripeSub.status === "trialing") {
        const periodStart = stripeSub.current_period_start
          ? new Date(stripeSub.current_period_start * 1000)
          : undefined;
        const periodEnd = stripeSub.current_period_end
          ? new Date(stripeSub.current_period_end * 1000)
          : undefined;

        await prisma.proSubscription.update({
          where: { userId },
          data: {
            status: "ACTIVE",
            ...(periodStart && { currentPeriodStart: periodStart }),
            ...(periodEnd && { currentPeriodEnd: periodEnd }),
            cancelAtPeriodEnd: stripeSub.cancel_at_period_end,
          },
        });

        console.log(`[Pro Sync] Synced subscription ${localSub.stripeSubscriptionId} to ACTIVE for user ${userId}`);
        return { synced: true, status: "ACTIVE" };
      }
    } catch (error) {
      console.error(`[Pro Sync] Failed to retrieve subscription ${localSub.stripeSubscriptionId}:`, error);
    }
  }

  // Strategy 2: Search by Stripe customer ID
  if (localSub?.stripeCustomerId) {
    try {
      const subs = await stripe.subscriptions.list({
        customer: localSub.stripeCustomerId,
        status: "active",
        limit: 1,
      });

      if (subs.data.length > 0) {
        const activeSub = subs.data[0];
        const periodStart = activeSub.current_period_start
          ? new Date(activeSub.current_period_start * 1000)
          : undefined;
        const periodEnd = activeSub.current_period_end
          ? new Date(activeSub.current_period_end * 1000)
          : undefined;

        // Determine plan from price
        const monthlyPriceId = process.env.STRIPE_PRO_MONTHLY_PRICE_ID;
        const priceId = activeSub.items.data[0]?.price?.id;
        const plan = priceId === monthlyPriceId ? "MONTHLY" : "YEARLY";

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

        console.log(`[Pro Sync] Found active subscription via customer ID for user ${userId}`);
        return { synced: true, status: "ACTIVE" };
      }
    } catch (error) {
      console.error(`[Pro Sync] Failed to list subscriptions for customer ${localSub.stripeCustomerId}:`, error);
    }
  }

  // Strategy 3: Search by email (catches cases where no local record exists or customer ID changed)
  if (userEmail) {
    try {
      const customers = await stripe.customers.list({
        email: userEmail,
        limit: 5,
      });

      for (const customer of customers.data) {
        const subs = await stripe.subscriptions.list({
          customer: customer.id,
          status: "active",
          limit: 1,
        });

        if (subs.data.length > 0) {
          const activeSub = subs.data[0];
          
          // Verify this is a pro subscription (check metadata or price ID)
          const monthlyPriceId = process.env.STRIPE_PRO_MONTHLY_PRICE_ID;
          const yearlyPriceId = process.env.STRIPE_PRO_YEARLY_PRICE_ID;
          const priceId = activeSub.items.data[0]?.price?.id;
          const isProPrice = priceId === monthlyPriceId || priceId === yearlyPriceId;
          const isProMetadata = activeSub.metadata?.type === "pro_subscription";

          if (isProPrice || isProMetadata) {
            const periodStart = activeSub.current_period_start
              ? new Date(activeSub.current_period_start * 1000)
              : undefined;
            const periodEnd = activeSub.current_period_end
              ? new Date(activeSub.current_period_end * 1000)
              : undefined;
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

            console.log(`[Pro Sync] Found active subscription via email lookup for user ${userId}`);
            return { synced: true, status: "ACTIVE" };
          }
        }
      }
    } catch (error) {
      console.error(`[Pro Sync] Failed email-based subscription lookup for ${userEmail}:`, error);
    }
  }

  // No active subscription found in Stripe
  return localSub ? { synced: false, status: localSub.status as "ACTIVE" | "PAST_DUE" | "CANCELLED" | "INACTIVE" } : null;
}
