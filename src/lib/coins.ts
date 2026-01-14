import { prisma } from "@/lib/prisma";
import { CoinTransactionType, Prisma } from "@prisma/client";

// Coin constants
export const INITIAL_COIN_BALANCE = 100;  // New users start with 100 coins
export const DAILY_LOGIN_BONUS = 5;       // Coins earned for daily login
export const MIN_FORECAST_COINS = 10;     // Minimum coins per forecast
export const MAX_FORECAST_COINS = 100;    // Maximum coins per forecast
export const WIN_MULTIPLIER = 2;          // Winners get 2x their stake

// Accuracy bonus thresholds
export const ACCURACY_BONUSES = {
  50: 25,   // 50% accuracy: 25 coins
  60: 50,   // 60% accuracy: 50 coins
  70: 100,  // 70% accuracy: 100 coins
  80: 200,  // 80% accuracy: 200 coins
  90: 500,  // 90% accuracy: 500 coins
} as const;

// Coin purchase packages
export const COIN_PURCHASE_PACKAGES = [
  {
    id: "starter",
    coins: 50,
    priceInCents: 100,  // $1
    label: "Starter Pack",
    description: "50 coins for $1",
    popular: false,
  },
  {
    id: "value",
    coins: 500,
    priceInCents: 500,  // $5
    label: "Value Pack",
    description: "500 coins for $5 (10x value!)",
    popular: true,
  },
  {
    id: "pro",
    coins: 2000,
    priceInCents: 1000,  // $10
    label: "Pro Pack",
    description: "2,000 coins for $10 (40x value!)",
    popular: false,
  },
  {
    id: "whale",
    coins: 5000,
    priceInCents: 2000,  // $20
    label: "Whale Pack",
    description: "5,000 coins for $20 (100x value!)",
    popular: false,
  },
] as const;

// Legal disclaimer for coin purchases
export const COIN_PURCHASE_DISCLAIMER =
  "Coins are non-refundable and for gamified forecasting only. " +
  "Coins have no monetary value, cannot be transferred, sold, or redeemed for cash. " +
  "They only affect rankings, badges, visibility, and access to features.";

/**
 * Grant coins to a user
 */
export async function grantCoins(
  userId: string,
  amount: number,
  type: CoinTransactionType,
  description?: string,
  metadata?: Prisma.InputJsonValue
): Promise<{ balance: number; transactionId: string }> {
  if (amount <= 0) {
    throw new Error("Grant amount must be positive");
  }

  const result = await prisma.$transaction(async (tx) => {
    // Create the transaction record
    const transaction = await tx.coinTransaction.create({
      data: {
        userId,
        amount,
        type,
        description,
        metadata,
      },
    });

    // Update the user's balance and lifetime coins earned
    const user = await tx.user.update({
      where: { id: userId },
      data: {
        coinBalance: { increment: amount },
        lifetimeCoinsEarned: { increment: amount },
      },
      select: { coinBalance: true },
    });

    return {
      balance: user.coinBalance,
      transactionId: transaction.id,
    };
  });

  return result;
}

/**
 * Spend coins from a user's balance
 * Returns the new balance and transaction ID, or throws if insufficient balance
 */
export async function spendCoins(
  userId: string,
  amount: number,
  type: CoinTransactionType,
  description?: string,
  metadata?: Prisma.InputJsonValue
): Promise<{ balance: number; transactionId: string }> {
  if (amount <= 0) {
    throw new Error("Spend amount must be positive");
  }

  const result = await prisma.$transaction(async (tx) => {
    // Check current balance
    const user = await tx.user.findUnique({
      where: { id: userId },
      select: { coinBalance: true },
    });

    if (!user) {
      throw new Error("User not found");
    }

    if (user.coinBalance < amount) {
      throw new Error("Insufficient coin balance");
    }

    // Create the transaction record (negative amount for spending)
    const transaction = await tx.coinTransaction.create({
      data: {
        userId,
        amount: -amount,
        type,
        description,
        metadata,
      },
    });

    // Update the user's balance
    const updatedUser = await tx.user.update({
      where: { id: userId },
      data: {
        coinBalance: { decrement: amount },
      },
      select: { coinBalance: true },
    });

    return {
      balance: updatedUser.coinBalance,
      transactionId: transaction.id,
    };
  });

  return result;
}

/**
 * Refund coins to a user (for cancelled forecasts)
 */
export async function refundCoins(
  userId: string,
  amount: number,
  description?: string,
  metadata?: Prisma.InputJsonValue
): Promise<{ balance: number; transactionId: string }> {
  return grantCoins(userId, amount, "FORECAST_CANCELLED", description, metadata);
}

/**
 * Get a user's current coin balance
 */
export async function getCoinBalance(userId: string): Promise<number> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { coinBalance: true },
  });

  return user?.coinBalance ?? 0;
}

/**
 * Check if a user has enough coins for a forecast
 */
export async function hasEnoughCoins(userId: string, amount: number): Promise<boolean> {
  const balance = await getCoinBalance(userId);
  return balance >= amount;
}

/**
 * Get a user's coin transaction history
 */
export async function getCoinTransactionHistory(
  userId: string,
  options?: {
    limit?: number;
    cursor?: string;
    type?: CoinTransactionType;
  }
): Promise<{
  transactions: Array<{
    id: string;
    amount: number;
    type: CoinTransactionType;
    description: string | null;
    metadata: Prisma.JsonValue;
    createdAt: Date;
  }>;
  nextCursor?: string;
}> {
  const limit = options?.limit ?? 20;

  const transactions = await prisma.coinTransaction.findMany({
    where: {
      userId,
      ...(options?.type && { type: options.type }),
    },
    orderBy: { createdAt: "desc" },
    take: limit + 1,
    ...(options?.cursor && {
      cursor: { id: options.cursor },
      skip: 1,
    }),
  });

  let nextCursor: string | undefined;
  if (transactions.length > limit) {
    const nextItem = transactions.pop();
    nextCursor = nextItem?.id;
  }

  return {
    transactions,
    nextCursor,
  };
}

/**
 * Grant welcome bonus coins to a new user
 */
export async function grantWelcomeBonus(userId: string): Promise<void> {
  // Check if user already received welcome bonus
  const existingBonus = await prisma.coinTransaction.findFirst({
    where: {
      userId,
      type: "WELCOME_BONUS",
    },
  });

  if (existingBonus) {
    return; // Already received
  }

  await grantCoins(
    userId,
    INITIAL_COIN_BALANCE,
    "WELCOME_BONUS",
    `Welcome! Here's ${INITIAL_COIN_BALANCE} coins to start forecasting.`
  );
}

/**
 * Grant daily login bonus if user hasn't received one today
 */
export async function grantDailyLoginBonus(userId: string): Promise<{ granted: boolean; balance: number }> {
  // Get start of today (midnight UTC)
  const today = new Date();
  today.setUTCHours(0, 0, 0, 0);

  // Check if user already received daily bonus today
  const existingBonus = await prisma.coinTransaction.findFirst({
    where: {
      userId,
      type: "DAILY_LOGIN",
      createdAt: { gte: today },
    },
  });

  if (existingBonus) {
    // Already received today
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { coinBalance: true },
    });
    return { granted: false, balance: user?.coinBalance ?? 0 };
  }

  // Grant the daily bonus
  const result = await grantCoins(
    userId,
    DAILY_LOGIN_BONUS,
    "DAILY_LOGIN",
    `Daily login bonus: +${DAILY_LOGIN_BONUS} coins`
  );

  return { granted: true, balance: result.balance };
}

/**
 * Update user's forecast accuracy stats
 */
export async function updateForecastAccuracy(userId: string): Promise<{
  accuracy: number | null;
  totalForecasts: number;
  wonForecasts: number;
}> {
  // Get all resolved forecasts for this user
  const stats = await prisma.forecast.groupBy({
    by: ["status"],
    where: {
      userId,
      status: { in: ["WON", "LOST"] },
    },
    _count: true,
  });

  const won = stats.find((s) => s.status === "WON")?._count ?? 0;
  const lost = stats.find((s) => s.status === "LOST")?._count ?? 0;
  const total = won + lost;

  const accuracy = total > 0 ? (won / total) * 100 : null;

  // Update user stats
  await prisma.user.update({
    where: { id: userId },
    data: {
      forecastAccuracy: accuracy,
      totalForecasts: total,
      wonForecasts: won,
    },
  });

  return {
    accuracy,
    totalForecasts: total,
    wonForecasts: won,
  };
}

/**
 * Check and grant accuracy bonus if user hits a milestone
 */
export async function checkAndGrantAccuracyBonus(
  userId: string,
  accuracy: number
): Promise<{ granted: boolean; amount?: number; milestone?: number }> {
  // Find the highest milestone the user qualifies for
  const milestones = Object.keys(ACCURACY_BONUSES)
    .map(Number)
    .sort((a, b) => b - a); // Sort descending

  for (const milestone of milestones) {
    if (accuracy >= milestone) {
      // Check if user already received this milestone bonus
      const existingBonus = await prisma.coinTransaction.findFirst({
        where: {
          userId,
          type: "ACCURACY_BONUS",
          metadata: {
            path: ["milestone"],
            equals: milestone,
          },
        },
      });

      if (existingBonus) {
        continue; // Already received this milestone, check next
      }

      const amount = ACCURACY_BONUSES[milestone as keyof typeof ACCURACY_BONUSES];

      await grantCoins(
        userId,
        amount,
        "ACCURACY_BONUS",
        `${milestone}% accuracy milestone reached!`,
        { milestone, accuracy }
      );

      return { granted: true, amount, milestone };
    }
  }

  return { granted: false };
}

/**
 * Get forecasting leaderboard
 */
export async function getForecastLeaderboard(
  options?: {
    limit?: number;
    sortBy?: "accuracy" | "coins" | "total";
  }
): Promise<
  Array<{
    id: string;
    name: string | null;
    image: string | null;
    slug: string | null;
    coinBalance: number;
    lifetimeCoinsEarned: number;
    forecastAccuracy: number | null;
    totalForecasts: number;
    wonForecasts: number;
  }>
> {
  const limit = options?.limit ?? 50;
  const sortBy = options?.sortBy ?? "accuracy";

  // Build order clause based on sort option
  let orderBy: Prisma.UserOrderByWithRelationInput[];
  switch (sortBy) {
    case "coins":
      orderBy = [{ lifetimeCoinsEarned: "desc" }, { forecastAccuracy: "desc" }];
      break;
    case "total":
      orderBy = [{ totalForecasts: "desc" }, { forecastAccuracy: "desc" }];
      break;
    case "accuracy":
    default:
      orderBy = [{ forecastAccuracy: "desc" }, { totalForecasts: "desc" }];
      break;
  }

  const users = await prisma.user.findMany({
    where: {
      totalForecasts: { gt: 0 }, // Only include users who have forecasted
    },
    select: {
      id: true,
      name: true,
      image: true,
      slug: true,
      coinBalance: true,
      lifetimeCoinsEarned: true,
      forecastAccuracy: true,
      totalForecasts: true,
      wonForecasts: true,
    },
    orderBy,
    take: limit,
  });

  return users;
}

/**
 * Get user's forecasting stats
 */
export async function getUserForecastStats(userId: string): Promise<{
  coinBalance: number;
  lifetimeCoinsEarned: number;
  forecastAccuracy: number | null;
  totalForecasts: number;
  wonForecasts: number;
  pendingForecasts: number;
  activeStake: number;
}> {
  const [user, pendingStats] = await Promise.all([
    prisma.user.findUnique({
      where: { id: userId },
      select: {
        coinBalance: true,
        lifetimeCoinsEarned: true,
        forecastAccuracy: true,
        totalForecasts: true,
        wonForecasts: true,
      },
    }),
    prisma.forecast.aggregate({
      where: {
        userId,
        status: "PENDING",
      },
      _count: true,
      _sum: { coinsStaked: true },
    }),
  ]);

  return {
    coinBalance: user?.coinBalance ?? 0,
    lifetimeCoinsEarned: user?.lifetimeCoinsEarned ?? 0,
    forecastAccuracy: user?.forecastAccuracy ?? null,
    totalForecasts: user?.totalForecasts ?? 0,
    wonForecasts: user?.wonForecasts ?? 0,
    pendingForecasts: pendingStats._count,
    activeStake: pendingStats._sum.coinsStaked ?? 0,
  };
}
