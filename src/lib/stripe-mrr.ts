import Stripe from "stripe";
import { prisma } from "@/lib/prisma";
import { getStripe } from "./stripe";

/**
 * Stripe MRR Integration for Forecasting System
 *
 * This module handles:
 * - OAuth connection for read-only access to Stripe accounts
 * - Fetching MRR from connected Stripe accounts
 * - Snapshotting MRR for historical tracking
 */

// OAuth scopes needed for MRR access
// Note: Stripe requires read_write by default; read_only requires special approval
export const STRIPE_OAUTH_SCOPES = "read_write";

// Stripe OAuth URLs
export const STRIPE_AUTHORIZE_URL = "https://connect.stripe.com/oauth/authorize";
export const STRIPE_TOKEN_URL = "https://connect.stripe.com/oauth/token";

/**
 * Generate the Stripe OAuth authorization URL
 */
export function getStripeOAuthUrl(
  userId: string,
  redirectUri: string
): string {
  const clientId = process.env.STRIPE_CLIENT_ID;

  if (!clientId) {
    throw new Error("STRIPE_CLIENT_ID is not set");
  }

  const params = new URLSearchParams({
    response_type: "code",
    client_id: clientId,
    scope: STRIPE_OAUTH_SCOPES,
    redirect_uri: redirectUri,
    state: userId, // Pass user ID as state for verification
  });

  return `${STRIPE_AUTHORIZE_URL}?${params.toString()}`;
}

/**
 * Exchange OAuth code for access tokens
 */
export async function exchangeStripeOAuthCode(
  code: string
): Promise<{
  accessToken: string;
  refreshToken: string;
  stripeUserId: string;
}> {
  const stripe = getStripe();

  const response = await stripe.oauth.token({
    grant_type: "authorization_code",
    code,
  });

  if (!response.access_token || !response.stripe_user_id) {
    throw new Error("Invalid OAuth response from Stripe");
  }

  return {
    accessToken: response.access_token,
    refreshToken: response.refresh_token || "",
    stripeUserId: response.stripe_user_id,
  };
}

/**
 * Refresh Stripe OAuth access token
 */
export async function refreshStripeAccessToken(
  refreshToken: string
): Promise<{
  accessToken: string;
  refreshToken: string;
}> {
  const stripe = getStripe();

  const response = await stripe.oauth.token({
    grant_type: "refresh_token",
    refresh_token: refreshToken,
  });

  return {
    accessToken: response.access_token || "",
    refreshToken: response.refresh_token || refreshToken,
  };
}

/**
 * Create a Stripe client using a connected account's access token
 */
function createConnectedStripeClient(accessToken: string): Stripe {
  return new Stripe(accessToken, {
    typescript: true,
  });
}

/**
 * Calculate MRR from a Stripe account
 * MRR = Sum of all active subscription amounts normalized to monthly
 */
export async function calculateMrr(accessToken: string): Promise<{
  mrr: number;
  subscriptionCount: number;
  customerCount: number;
  metadata: {
    currency: string;
    calculatedAt: string;
  };
}> {
  const stripe = createConnectedStripeClient(accessToken);

  let mrr = 0;
  let subscriptionCount = 0;
  const customerIds = new Set<string>();

  // Fetch all active subscriptions
  let hasMore = true;
  let startingAfter: string | undefined;

  while (hasMore) {
    const subscriptions = await stripe.subscriptions.list({
      status: "active",
      limit: 100,
      ...(startingAfter && { starting_after: startingAfter }),
      expand: ["data.items.data.price"],
    });

    for (const subscription of subscriptions.data) {
      subscriptionCount++;

      if (subscription.customer) {
        customerIds.add(
          typeof subscription.customer === "string"
            ? subscription.customer
            : subscription.customer.id
        );
      }

      // Calculate MRR for this subscription
      for (const item of subscription.items.data) {
        const price = item.price;
        const quantity = item.quantity || 1;

        if (!price.unit_amount) continue;

        // Normalize to monthly amount
        let monthlyAmount = price.unit_amount * quantity;

        switch (price.recurring?.interval) {
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
            monthlyAmount = monthlyAmount / 12;
            break;
          default:
            // One-time prices don't count as MRR
            monthlyAmount = 0;
        }

        // Handle interval_count (e.g., every 3 months)
        if (price.recurring?.interval_count && price.recurring.interval_count > 1) {
          if (price.recurring.interval === "month") {
            monthlyAmount = monthlyAmount / price.recurring.interval_count;
          } else if (price.recurring.interval === "year") {
            // Already handled above
          }
        }

        mrr += Math.round(monthlyAmount);
      }
    }

    hasMore = subscriptions.has_more;
    if (subscriptions.data.length > 0) {
      startingAfter = subscriptions.data[subscriptions.data.length - 1].id;
    }
  }

  return {
    mrr,
    subscriptionCount,
    customerCount: customerIds.size,
    metadata: {
      currency: "usd", // Assuming USD for simplicity
      calculatedAt: new Date().toISOString(),
    },
  };
}

/**
 * Fetch and update MRR for a forecast target
 */
export async function updateTargetMrr(targetId: string): Promise<{
  mrr: number;
  success: boolean;
  error?: string;
}> {
  try {
    const target = await prisma.forecastTarget.findUnique({
      where: { id: targetId },
      select: {
        stripeAccessToken: true,
        stripeRefreshToken: true,
      },
    });

    if (!target?.stripeAccessToken) {
      return { mrr: 0, success: false, error: "No Stripe connection" };
    }

    let accessToken = target.stripeAccessToken;

    // Try to calculate MRR
    try {
      const result = await calculateMrr(accessToken);

      // Update the target with new MRR
      await prisma.forecastTarget.update({
        where: { id: targetId },
        data: {
          currentMrr: result.mrr,
          lastMrrUpdate: new Date(),
        },
      });

      // Create a snapshot
      await prisma.mrrSnapshot.create({
        data: {
          targetId,
          mrr: result.mrr,
          source: "stripe",
          metadata: result.metadata,
        },
      });

      return { mrr: result.mrr, success: true };
    } catch (stripeError) {
      // If access token expired, try to refresh
      if (target.stripeRefreshToken) {
        try {
          const newTokens = await refreshStripeAccessToken(target.stripeRefreshToken);

          // Update tokens
          await prisma.forecastTarget.update({
            where: { id: targetId },
            data: {
              stripeAccessToken: newTokens.accessToken,
              stripeRefreshToken: newTokens.refreshToken,
            },
          });

          // Retry with new token
          const result = await calculateMrr(newTokens.accessToken);

          await prisma.forecastTarget.update({
            where: { id: targetId },
            data: {
              currentMrr: result.mrr,
              lastMrrUpdate: new Date(),
            },
          });

          await prisma.mrrSnapshot.create({
            data: {
              targetId,
              mrr: result.mrr,
              source: "stripe",
              metadata: result.metadata,
            },
          });

          return { mrr: result.mrr, success: true };
        } catch {
          return { mrr: 0, success: false, error: "Failed to refresh Stripe token" };
        }
      }

      throw stripeError;
    }
  } catch (error) {
    console.error("Error updating MRR:", error);
    return {
      mrr: 0,
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Update MRR for all active forecast targets
 * This should be called by a daily cron job
 */
export async function updateAllTargetsMrr(): Promise<{
  total: number;
  success: number;
  failed: number;
  results: Array<{
    targetId: string;
    userId: string;
    success: boolean;
    mrr?: number;
    error?: string;
  }>;
}> {
  const targets = await prisma.forecastTarget.findMany({
    where: {
      isActive: true,
      stripeAccessToken: { not: null },
    },
    select: {
      id: true,
      userId: true,
    },
  });

  const results = [];
  let success = 0;
  let failed = 0;

  for (const target of targets) {
    const result = await updateTargetMrr(target.id);

    results.push({
      targetId: target.id,
      userId: target.userId,
      success: result.success,
      mrr: result.success ? result.mrr : undefined,
      error: result.error,
    });

    if (result.success) {
      success++;
    } else {
      failed++;
    }

    // Rate limiting - wait a bit between API calls
    await new Promise((resolve) => setTimeout(resolve, 500));
  }

  return {
    total: targets.length,
    success,
    failed,
    results,
  };
}

/**
 * Get MRR history for a target
 */
export async function getMrrHistory(
  targetId: string,
  options?: {
    limit?: number;
    startDate?: Date;
    endDate?: Date;
  }
): Promise<
  Array<{
    mrr: number;
    snapshotAt: Date;
  }>
> {
  const limit = options?.limit ?? 1; // Default to last 1 day

  const snapshots = await prisma.mrrSnapshot.findMany({
    where: {
      targetId,
      ...(options?.startDate && { snapshotAt: { gte: options.startDate } }),
      ...(options?.endDate && { snapshotAt: { lte: options.endDate } }),
    },
    select: {
      mrr: true,
      snapshotAt: true,
    },
    orderBy: { snapshotAt: "desc" },
    take: limit,
  });

  return snapshots;
}

/**
 * Disconnect Stripe from a forecast target
 */
export async function disconnectStripe(targetId: string): Promise<void> {
  await prisma.forecastTarget.update({
    where: { id: targetId },
    data: {
      stripeAccountId: null,
      stripeAccessToken: null,
      stripeRefreshToken: null,
      stripeConnectedAt: null,
      isActive: false,
      currentMrr: null,
      lastMrrUpdate: null,
    },
  });
}

/**
 * Check if a forecast target has a valid Stripe connection
 */
export async function hasValidStripeConnection(targetId: string): Promise<boolean> {
  const target = await prisma.forecastTarget.findUnique({
    where: { id: targetId },
    select: {
      stripeAccessToken: true,
      stripeConnectedAt: true,
    },
  });

  if (!target?.stripeAccessToken) {
    return false;
  }

  // Try to make a simple API call to verify the connection
  try {
    const stripe = createConnectedStripeClient(target.stripeAccessToken);
    await stripe.balance.retrieve();
    return true;
  } catch {
    return false;
  }
}
