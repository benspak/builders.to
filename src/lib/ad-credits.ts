import { prisma } from "./prisma";
import { getSubscriptionTier } from "./stripe-subscription";

/** Ad credits granted per tier per month (Founders Edition). */
export const AD_CREDITS_GRANT = {
  PRO: 50,
  PREMIUM: 100,
  FOUNDERS_CIRCLE: 250,
} as const;

/** Ad credits earned per post for Free tier. */
export const AD_CREDITS_EARNED_PER_POST = 1;

/** Start of current month in UTC (for period comparison). */
function startOfCurrentMonth(): Date {
  const now = new Date();
  return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1));
}

/**
 * Ensure the user has received their monthly ad credits grant for the current period.
 * Called when we need to read or use balance; applies grant if period has rolled over.
 */
export async function ensureMonthlyGrant(userId: string): Promise<void> {
  const tier = await getSubscriptionTier(userId);
  if (tier === "FREE") return;

  const periodStart = startOfCurrentMonth();
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { adCreditsBalance: true, adCreditsPeriodStart: true },
  });

  if (!user) return;

  const lastPeriod = user.adCreditsPeriodStart
    ? new Date(user.adCreditsPeriodStart)
    : null;
  const periodStartTime = periodStart.getTime();
  const lastPeriodTime = lastPeriod
    ? new Date(lastPeriod.getFullYear(), lastPeriod.getMonth(), 1).getTime()
    : 0;

  if (lastPeriodTime >= periodStartTime) return;

  const grant = AD_CREDITS_GRANT[tier];
  await prisma.user.update({
    where: { id: userId },
    data: {
      adCreditsBalance: grant,
      adCreditsPeriodStart: periodStart,
    },
  });
}

/**
 * Grant ad credits to a Free user for posting an update.
 * No-op for paid tiers (they get monthly grant only).
 */
export async function grantEarnedForPost(userId: string): Promise<void> {
  const tier = await getSubscriptionTier(userId);
  if (tier !== "FREE") return;

  await prisma.user.update({
    where: { id: userId },
    data: {
      adCreditsBalance: { increment: AD_CREDITS_EARNED_PER_POST },
    },
  });
}

/**
 * Get current ad credits balance for the user.
 * Ensures monthly grant is applied for paid tiers before returning.
 */
export async function getAdCreditsBalance(userId: string): Promise<number> {
  await ensureMonthlyGrant(userId);
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { adCreditsBalance: true },
  });
  return user?.adCreditsBalance ?? 0;
}
