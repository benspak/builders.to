import Stripe from "stripe";
import { getStripe } from "./stripe";
import { prisma } from "./prisma";

const MASTERMIND_MONTHLY_PRICE_CENTS = 900; // $9/month

export function getMastermindPriceId(): string {
  const priceId = process.env.STRIPE_MASTERMIND_MONTHLY_PRICE_ID;
  if (!priceId) {
    throw new Error("STRIPE_MASTERMIND_MONTHLY_PRICE_ID is not configured");
  }
  return priceId;
}

export async function createMastermindCheckoutSession(
  userId: string,
  email: string,
  returnUrl: string
): Promise<{ sessionId: string; url: string }> {
  const stripe = getStripe();
  const priceId = getMastermindPriceId();

  const existing = await prisma.mastermindSubscription.findUnique({
    where: { userId },
    select: { stripeCustomerId: true },
  });

  const sessionParams: Stripe.Checkout.SessionCreateParams = {
    mode: "subscription",
    payment_method_types: ["card"],
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: `${returnUrl}?mastermind=success&session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${returnUrl}?mastermind=cancelled`,
    metadata: {
      type: "mastermind_subscription",
      userId,
    },
    subscription_data: {
      metadata: {
        type: "mastermind_subscription",
        userId,
      },
    },
  };

  if (existing?.stripeCustomerId) {
    sessionParams.customer = existing.stripeCustomerId;
  } else {
    sessionParams.customer_email = email;
  }

  const session = await stripe.checkout.sessions.create(sessionParams);
  return {
    sessionId: session.id,
    url: session.url!,
  };
}

export async function isMastermindMember(userId: string): Promise<boolean> {
  const sub = await prisma.mastermindSubscription.findUnique({
    where: { userId },
    select: { status: true },
  });
  return sub?.status === "ACTIVE";
}

function isValidDate(date: Date | null | undefined): date is Date {
  return date instanceof Date && !isNaN(date.getTime());
}

export async function activateMastermindSubscription(
  userId: string,
  stripeCustomerId: string,
  stripeSubscriptionId: string,
  stripePriceId: string,
  currentPeriodStart: Date,
  currentPeriodEnd: Date
): Promise<void> {
  const validStart = isValidDate(currentPeriodStart) ? currentPeriodStart : new Date();
  const validEnd = isValidDate(currentPeriodEnd)
    ? currentPeriodEnd
    : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

  await prisma.mastermindSubscription.upsert({
    where: { userId },
    create: {
      userId,
      stripeCustomerId,
      stripeSubscriptionId,
      stripePriceId,
      status: "ACTIVE",
      currentPeriodStart: validStart,
      currentPeriodEnd: validEnd,
      cancelAtPeriodEnd: false,
    },
    update: {
      stripeCustomerId,
      stripeSubscriptionId,
      stripePriceId,
      status: "ACTIVE",
      currentPeriodStart: validStart,
      currentPeriodEnd: validEnd,
      cancelAtPeriodEnd: false,
    },
  });
}

export async function updateMastermindSubscriptionStatus(
  stripeSubscriptionId: string,
  status: "ACTIVE" | "PAST_DUE" | "CANCELLED" | "INACTIVE",
  currentPeriodStart?: Date,
  currentPeriodEnd?: Date,
  cancelAtPeriodEnd?: boolean,
  userId?: string
): Promise<void> {
  const updateData: {
    status: "ACTIVE" | "PAST_DUE" | "CANCELLED" | "INACTIVE";
    currentPeriodStart?: Date;
    currentPeriodEnd?: Date;
    cancelAtPeriodEnd?: boolean;
    stripeSubscriptionId?: string;
  } = { status };
  if (currentPeriodStart) updateData.currentPeriodStart = currentPeriodStart;
  if (currentPeriodEnd) updateData.currentPeriodEnd = currentPeriodEnd;
  if (cancelAtPeriodEnd !== undefined) updateData.cancelAtPeriodEnd = cancelAtPeriodEnd;

  try {
    await prisma.mastermindSubscription.update({
      where: { stripeSubscriptionId },
      data: updateData,
    });
    return;
  } catch {
    if (!userId) throw new Error("No userId for fallback");
  }
  updateData.stripeSubscriptionId = stripeSubscriptionId;
  await prisma.mastermindSubscription.update({
    where: { userId },
    data: updateData,
  });
}

export { MASTERMIND_MONTHLY_PRICE_CENTS };
