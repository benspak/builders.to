import Stripe from "stripe";
import { getStripe } from "./stripe";
import { prisma } from "./prisma";

/**
 * Lifetime Pro Membership - one-time $500, limited to 100 members.
 * Uses Stripe Checkout in payment mode (one-time), not subscription.
 */

export const LIFETIME_CAP = 100;
export const LIFETIME_PRICE_CENTS = 50000; // $500

function getLifetimePriceId(): string {
  const priceId = process.env.STRIPE_LIFETIME_PRICE_ID;
  if (!priceId) {
    throw new Error("STRIPE_LIFETIME_PRICE_ID is not configured");
  }
  return priceId;
}

/**
 * Get how many lifetime memberships have been sold and how many remain.
 */
export async function getLifetimeRemaining(): Promise<{
  sold: number;
  remaining: number;
  cap: number;
}> {
  const sold = await prisma.lifetimeMember.count();
  const remaining = Math.max(0, LIFETIME_CAP - sold);
  return { sold, remaining, cap: LIFETIME_CAP };
}

/**
 * Create a Stripe Checkout session for lifetime membership (one-time payment).
 * Fails if cap reached or user is already a lifetime member.
 */
export async function createLifetimeCheckoutSession(
  userId: string,
  email: string,
  returnUrl: string
): Promise<{ sessionId: string; url: string }> {
  const { remaining } = await getLifetimeRemaining();
  if (remaining <= 0) {
    throw new Error("Lifetime memberships are sold out");
  }

  const existing = await prisma.lifetimeMember.findUnique({
    where: { userId },
  });
  if (existing) {
    throw new Error("You already have a lifetime membership");
  }

  const stripe = getStripe();
  const priceId = getLifetimePriceId();

  // Reuse Stripe customer if they have a Pro subscription
  const existingPro = await prisma.proSubscription.findUnique({
    where: { userId },
    select: { stripeCustomerId: true },
  });

  const sessionParams: Stripe.Checkout.SessionCreateParams = {
    mode: "payment",
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
      type: "lifetime_membership",
      userId,
    },
  };

  if (existingPro?.stripeCustomerId) {
    sessionParams.customer = existingPro.stripeCustomerId;
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
 * Activate lifetime membership after successful checkout.
 * Creates LifetimeMember and upserts ProSubscription with LIFETIME plan.
 */
export async function activateLifetimeMembership(
  userId: string,
  stripeSessionId: string
): Promise<void> {
  await prisma.$transaction(async (tx) => {
    // Idempotent: skip if already recorded (e.g. duplicate webhook)
    const existing = await tx.lifetimeMember.findUnique({
      where: { userId },
    });
    if (existing) {
      console.log(`[Lifetime] User ${userId} already has lifetime, skipping`);
      return;
    }

    await tx.lifetimeMember.create({
      data: {
        userId,
        stripeSessionId,
      },
    });

    // Grant Pro access via ProSubscription (LIFETIME plan, no Stripe subscription)
    await tx.proSubscription.upsert({
      where: { userId },
      create: {
        userId,
        status: "ACTIVE",
        plan: "LIFETIME",
        stripeCustomerId: null,
        stripeSubscriptionId: null,
        stripePriceId: null,
        currentPeriodStart: new Date(),
        currentPeriodEnd: null, // Never expires
        cancelAtPeriodEnd: false,
      },
      update: {
        status: "ACTIVE",
        plan: "LIFETIME",
        stripeSubscriptionId: null,
        stripePriceId: null,
        currentPeriodEnd: null,
        cancelAtPeriodEnd: false,
      },
    });
  });

  console.log(`[Lifetime] Activated lifetime membership for user ${userId}`);
}

/**
 * Check if a user is a lifetime member (by record only; Pro status is in ProSubscription).
 */
export async function isLifetimeMember(userId: string): Promise<boolean> {
  const record = await prisma.lifetimeMember.findUnique({
    where: { userId },
    select: { id: true },
  });
  return !!record;
}
