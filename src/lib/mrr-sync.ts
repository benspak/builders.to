/**
 * MRR Sync - Fetch MRR data from Stripe Connect accounts
 *
 * This module handles pulling Monthly Recurring Revenue data from
 * connected Stripe accounts for use in the betting system.
 */

import { getStripe } from "./stripe";
import { prisma } from "./prisma";
import type { BetTargetType } from "@prisma/client";

/**
 * Fetch MRR from a Stripe Connect account
 *
 * MRR is calculated as the sum of all active subscription amounts
 * normalized to monthly values.
 */
export async function fetchMrrFromStripe(stripeConnectId: string): Promise<number> {
  const stripe = getStripe();

  try {
    // Fetch all active subscriptions from the connected account
    const subscriptions = await stripe.subscriptions.list(
      {
        status: "active",
        limit: 100,
      },
      {
        stripeAccount: stripeConnectId,
      }
    );

    let totalMrrCents = 0;

    for (const subscription of subscriptions.data) {
      for (const item of subscription.items.data) {
        const price = item.price;
        const quantity = item.quantity || 1;

        if (!price.unit_amount) continue;

        // Normalize to monthly amount
        let monthlyAmount = price.unit_amount * quantity;

        if (price.recurring) {
          switch (price.recurring.interval) {
            case "day":
              monthlyAmount = monthlyAmount * 30;
              break;
            case "week":
              monthlyAmount = monthlyAmount * 4;
              break;
            case "month":
              // Already monthly
              break;
            case "year":
              monthlyAmount = Math.round(monthlyAmount / 12);
              break;
          }

          // Account for interval_count (e.g., every 3 months)
          if (price.recurring.interval_count > 1 && price.recurring.interval !== "year") {
            monthlyAmount = Math.round(monthlyAmount / price.recurring.interval_count);
          }
        }

        totalMrrCents += monthlyAmount;
      }
    }

    // Handle pagination if there are more subscriptions
    let hasMore = subscriptions.has_more;
    let lastId = subscriptions.data[subscriptions.data.length - 1]?.id;

    while (hasMore && lastId) {
      const moreSubscriptions = await stripe.subscriptions.list(
        {
          status: "active",
          limit: 100,
          starting_after: lastId,
        },
        {
          stripeAccount: stripeConnectId,
        }
      );

      for (const subscription of moreSubscriptions.data) {
        for (const item of subscription.items.data) {
          const price = item.price;
          const quantity = item.quantity || 1;

          if (!price.unit_amount) continue;

          let monthlyAmount = price.unit_amount * quantity;

          if (price.recurring) {
            switch (price.recurring.interval) {
              case "day":
                monthlyAmount = monthlyAmount * 30;
                break;
              case "week":
                monthlyAmount = monthlyAmount * 4;
                break;
              case "month":
                break;
              case "year":
                monthlyAmount = Math.round(monthlyAmount / 12);
                break;
            }

            if (price.recurring.interval_count > 1 && price.recurring.interval !== "year") {
              monthlyAmount = Math.round(monthlyAmount / price.recurring.interval_count);
            }
          }

          totalMrrCents += monthlyAmount;
        }
      }

      hasMore = moreSubscriptions.has_more;
      lastId = moreSubscriptions.data[moreSubscriptions.data.length - 1]?.id;
    }

    return totalMrrCents;
  } catch (error) {
    console.error(`Error fetching MRR from Stripe Connect ${stripeConnectId}:`, error);
    throw error;
  }
}

/**
 * Save an MRR snapshot to the database
 */
export async function saveMrrSnapshot(params: {
  targetType: BetTargetType;
  targetId: string;
  mrrCents: number;
  quarter: string;
  isStartSnapshot: boolean;
}): Promise<void> {
  const { targetType, targetId, mrrCents, quarter, isStartSnapshot } = params;

  await prisma.mrrSnapshot.upsert({
    where: {
      targetType_targetId_quarter_isStartSnapshot: {
        targetType,
        targetId,
        quarter,
        isStartSnapshot,
      },
    },
    create: {
      targetType,
      targetId,
      mrrCents,
      quarter,
      isStartSnapshot,
      snapshotAt: new Date(),
    },
    update: {
      mrrCents,
      snapshotAt: new Date(),
    },
  });
}

/**
 * Get MRR snapshot for a target
 */
export async function getMrrSnapshot(params: {
  targetType: BetTargetType;
  targetId: string;
  quarter: string;
  isStartSnapshot: boolean;
}): Promise<{ mrrCents: number; snapshotAt: Date } | null> {
  const { targetType, targetId, quarter, isStartSnapshot } = params;

  const snapshot = await prisma.mrrSnapshot.findUnique({
    where: {
      targetType_targetId_quarter_isStartSnapshot: {
        targetType,
        targetId,
        quarter,
        isStartSnapshot,
      },
    },
    select: {
      mrrCents: true,
      snapshotAt: true,
    },
  });

  return snapshot;
}

/**
 * Fetch and save MRR for a company
 */
export async function syncCompanyMrr(
  companyId: string,
  quarter: string,
  isStartSnapshot: boolean
): Promise<number | null> {
  // Get the company's Stripe Connect ID
  const company = await prisma.company.findUnique({
    where: { id: companyId },
    select: {
      stripeConnectId: true,
      stripeConnectOnboarded: true,
      bettingEnabled: true,
    },
  });

  if (!company?.stripeConnectId || !company.stripeConnectOnboarded) {
    console.log(`Company ${companyId} has no connected Stripe account`);
    return null;
  }

  if (!company.bettingEnabled) {
    console.log(`Company ${companyId} has betting disabled`);
    return null;
  }

  try {
    const mrrCents = await fetchMrrFromStripe(company.stripeConnectId);

    await saveMrrSnapshot({
      targetType: "COMPANY",
      targetId: companyId,
      mrrCents,
      quarter,
      isStartSnapshot,
    });

    return mrrCents;
  } catch (error) {
    console.error(`Failed to sync MRR for company ${companyId}:`, error);
    return null;
  }
}

/**
 * Fetch and save MRR for a user (founder)
 *
 * For users, we sum up MRR across all their companies with betting enabled
 */
export async function syncUserMrr(
  userId: string,
  quarter: string,
  isStartSnapshot: boolean
): Promise<number | null> {
  // Check if user has betting enabled
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      bettingEnabled: true,
      stripeConnectId: true,
      stripeConnectOnboarded: true,
      companies: {
        where: {
          stripeConnectId: { not: null },
          stripeConnectOnboarded: true,
        },
        select: {
          id: true,
          stripeConnectId: true,
        },
      },
    },
  });

  if (!user?.bettingEnabled) {
    console.log(`User ${userId} has betting disabled`);
    return null;
  }

  let totalMrrCents = 0;

  // If user has their own Stripe Connect (for services, etc.)
  if (user.stripeConnectId && user.stripeConnectOnboarded) {
    try {
      const userMrr = await fetchMrrFromStripe(user.stripeConnectId);
      totalMrrCents += userMrr;
    } catch (error) {
      console.error(`Failed to fetch MRR for user ${userId} direct account:`, error);
    }
  }

  // Sum up MRR from all their companies
  for (const company of user.companies) {
    if (company.stripeConnectId) {
      try {
        const companyMrr = await fetchMrrFromStripe(company.stripeConnectId);
        totalMrrCents += companyMrr;
      } catch (error) {
        console.error(`Failed to fetch MRR for company ${company.id}:`, error);
      }
    }
  }

  // Only save if we got some data
  if (totalMrrCents > 0 || user.stripeConnectId || user.companies.length > 0) {
    await saveMrrSnapshot({
      targetType: "USER",
      targetId: userId,
      mrrCents: totalMrrCents,
      quarter,
      isStartSnapshot,
    });

    return totalMrrCents;
  }

  return null;
}

/**
 * Sync all bettable targets for a quarter
 */
export async function syncAllMrr(
  quarter: string,
  isStartSnapshot: boolean
): Promise<{
  companies: { synced: number; failed: number };
  users: { synced: number; failed: number };
}> {
  const stats = {
    companies: { synced: 0, failed: 0 },
    users: { synced: 0, failed: 0 },
  };

  // Sync all companies with betting enabled
  const companies = await prisma.company.findMany({
    where: {
      bettingEnabled: true,
      stripeConnectId: { not: null },
      stripeConnectOnboarded: true,
    },
    select: { id: true },
  });

  for (const company of companies) {
    const result = await syncCompanyMrr(company.id, quarter, isStartSnapshot);
    if (result !== null) {
      stats.companies.synced++;
    } else {
      stats.companies.failed++;
    }
  }

  // Sync all users with betting enabled
  const users = await prisma.user.findMany({
    where: {
      bettingEnabled: true,
    },
    select: { id: true },
  });

  for (const user of users) {
    const result = await syncUserMrr(user.id, quarter, isStartSnapshot);
    if (result !== null) {
      stats.users.synced++;
    } else {
      stats.users.failed++;
    }
  }

  return stats;
}

/**
 * Get the latest MRR for a betting target
 */
export async function getLatestMrr(
  targetType: BetTargetType,
  targetId: string
): Promise<{ mrrCents: number; quarter: string; snapshotAt: Date } | null> {
  const snapshot = await prisma.mrrSnapshot.findFirst({
    where: {
      targetType,
      targetId,
    },
    orderBy: {
      snapshotAt: "desc",
    },
    select: {
      mrrCents: true,
      quarter: true,
      snapshotAt: true,
    },
  });

  return snapshot;
}
