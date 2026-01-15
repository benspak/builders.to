import Stripe from "stripe";
import { getStripe } from "./stripe";
import { prisma } from "./prisma";
import { grantTokens } from "./tokens";

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
export const PRO_TOKENS_PER_MONTH = 50;

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
 * Grant monthly tokens to a Pro subscriber
 * Called by webhook when invoice is paid
 */
export async function grantProTokens(userId: string): Promise<boolean> {
  try {
    const subscription = await prisma.proSubscription.findUnique({
      where: { userId },
      select: { lastTokenGrantAt: true, currentPeriodStart: true },
    });

    if (!subscription) {
      return false;
    }

    // Prevent duplicate grants in the same billing period
    const periodStart = subscription.currentPeriodStart;
    if (subscription.lastTokenGrantAt && periodStart) {
      if (subscription.lastTokenGrantAt >= periodStart) {
        console.log("[Pro Subscription] Tokens already granted for this period");
        return false;
      }
    }

    // Grant tokens
    await grantTokens(
      userId,
      PRO_TOKENS_PER_MONTH,
      "PRO_SUBSCRIPTION_GRANT",
      "Monthly Pro subscription token grant"
    );

    // Update last grant time
    await prisma.proSubscription.update({
      where: { userId },
      data: { lastTokenGrantAt: new Date() },
    });

    console.log(`[Pro Subscription] Granted ${PRO_TOKENS_PER_MONTH} tokens to user ${userId}`);
    return true;
  } catch (error) {
    console.error("[Pro Subscription] Failed to grant tokens:", error);
    return false;
  }
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
