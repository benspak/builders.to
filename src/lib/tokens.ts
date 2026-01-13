import { prisma } from "@/lib/prisma";
import { TokenTransactionType, Prisma } from "@prisma/client";

// Token constants
export const TOKENS_PER_DOLLAR = 10; // 10 tokens = $1
export const WELCOME_BONUS_TOKENS = 5; // 5 tokens ($0.50) for new users
export const REFERRAL_REWARD_TOKENS = 10; // 10 tokens ($1) for referrer
export const ENGAGEMENT_BONUS_TOKENS = 1; // 1 token for posting daily update
export const PROFILE_COMPLETION_TOKENS = 10; // 10 tokens ($1) for 100% profile completion
export const STREAK_MILESTONES = {
  7: 5,   // 7-day streak: 5 tokens
  30: 20, // 30-day streak: 20 tokens
  100: 50, // 100-day streak: 50 tokens
} as const;

// Redemption costs (in tokens)
export const AD_REDEMPTION_COST = 50; // 50 tokens = $5 (sidebar ad)
export const SERVICE_REDEMPTION_COST = 10; // 10 tokens = $1 (service listing)
export const LOCAL_LISTING_REDEMPTION_COST = 10; // 10 tokens = $1 (local listing)

// Gift token packages
export const GIFT_PACKAGES = [
  {
    id: "service_listing",
    tokens: 10,
    priceInCents: 100,
    label: "Service Listing",
    description: "Gift tokens so they can list a service"
  },
  {
    id: "ad_month",
    tokens: 50,
    priceInCents: 500,
    label: "Ad for 1 Month",
    description: "Gift tokens so they can display an ad for 1 month"
  },
] as const;

// Token purchase packages (for buying tokens for yourself)
export const TOKEN_PURCHASE_PACKAGES = [
  {
    id: "starter",
    tokens: 10,
    priceInCents: 100,
    label: "Starter Pack",
    description: "Enough for a service listing",
    popular: false,
  },
  {
    id: "builder",
    tokens: 50,
    priceInCents: 500,
    label: "Builder Pack",
    description: "Enough for a sidebar ad",
    popular: true,
  },
  {
    id: "pro",
    tokens: 100,
    priceInCents: 900,
    label: "Pro Pack",
    description: "Best value - 10% savings",
    popular: false,
  },
] as const;

/**
 * Generate a unique referral code for a user
 * Format: XXXX-XXXXXX (4 chars from slug + 6 random chars)
 */
export async function generateReferralCode(userId: string): Promise<string> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { slug: true },
  });

  const prefix = user?.slug?.slice(0, 4).toUpperCase() || "USER";

  // Generate a unique code
  let code: string;
  let exists = true;

  while (exists) {
    const randomPart = Math.random().toString(36).substring(2, 8).toUpperCase();
    code = `${prefix}-${randomPart}`;

    const existing = await prisma.user.findUnique({
      where: { referralCode: code },
    });

    exists = !!existing;
  }

  // Update the user with their new referral code
  await prisma.user.update({
    where: { id: userId },
    data: { referralCode: code! },
  });

  return code!;
}

/**
 * Get a user's referral code, generating one if they don't have one
 */
export async function getReferralCode(userId: string): Promise<string> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { referralCode: true },
  });

  if (user?.referralCode) {
    return user.referralCode;
  }

  return generateReferralCode(userId);
}

/**
 * Find a user by their referral code
 */
export async function findUserByReferralCode(code: string): Promise<string | null> {
  const user = await prisma.user.findUnique({
    where: { referralCode: code.toUpperCase() },
    select: { id: true },
  });

  return user?.id || null;
}

/**
 * Grant tokens to a user
 */
export async function grantTokens(
  userId: string,
  amount: number,
  type: TokenTransactionType,
  description?: string,
  metadata?: Prisma.InputJsonValue
): Promise<{ balance: number; transactionId: string }> {
  if (amount <= 0) {
    throw new Error("Grant amount must be positive");
  }

  // Use a transaction to ensure atomicity
  const result = await prisma.$transaction(async (tx) => {
    // Create the transaction record
    const transaction = await tx.tokenTransaction.create({
      data: {
        userId,
        amount,
        type,
        description,
        metadata,
      },
    });

    // Update the user's balance and lifetime tokens earned
    const user = await tx.user.update({
      where: { id: userId },
      data: {
        tokenBalance: { increment: amount },
        lifetimeTokensEarned: { increment: amount },
      },
      select: { tokenBalance: true },
    });

    return {
      balance: user.tokenBalance,
      transactionId: transaction.id,
    };
  });

  return result;
}

/**
 * Spend tokens from a user's balance
 * Returns the new balance and transaction ID, or throws if insufficient balance
 */
export async function spendTokens(
  userId: string,
  amount: number,
  type: TokenTransactionType,
  description?: string,
  metadata?: Prisma.InputJsonValue
): Promise<{ balance: number; transactionId: string }> {
  if (amount <= 0) {
    throw new Error("Spend amount must be positive");
  }

  // Use a transaction to ensure atomicity
  const result = await prisma.$transaction(async (tx) => {
    // Check current balance
    const user = await tx.user.findUnique({
      where: { id: userId },
      select: { tokenBalance: true },
    });

    if (!user) {
      throw new Error("User not found");
    }

    if (user.tokenBalance < amount) {
      throw new Error("Insufficient token balance");
    }

    // Create the transaction record (negative amount for spending)
    const transaction = await tx.tokenTransaction.create({
      data: {
        userId,
        amount: -amount, // Negative for spending
        type,
        description,
        metadata,
      },
    });

    // Update the user's balance
    const updatedUser = await tx.user.update({
      where: { id: userId },
      data: {
        tokenBalance: { decrement: amount },
      },
      select: { tokenBalance: true },
    });

    return {
      balance: updatedUser.tokenBalance,
      transactionId: transaction.id,
    };
  });

  return result;
}

/**
 * Get a user's current token balance
 */
export async function getBalance(userId: string): Promise<number> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { tokenBalance: true },
  });

  return user?.tokenBalance ?? 0;
}

/**
 * Check if a user has enough tokens for a purchase
 */
export async function hasEnoughTokens(userId: string, amount: number): Promise<boolean> {
  const balance = await getBalance(userId);
  return balance >= amount;
}

/**
 * Get a user's token transaction history
 */
export async function getTransactionHistory(
  userId: string,
  options?: {
    limit?: number;
    cursor?: string;
    type?: TokenTransactionType;
  }
): Promise<{
  transactions: Array<{
    id: string;
    amount: number;
    type: TokenTransactionType;
    description: string | null;
    metadata: Prisma.JsonValue;
    createdAt: Date;
  }>;
  nextCursor?: string;
}> {
  const limit = options?.limit ?? 20;

  const transactions = await prisma.tokenTransaction.findMany({
    where: {
      userId,
      ...(options?.type && { type: options.type }),
    },
    orderBy: { createdAt: "desc" },
    take: limit + 1, // Take one extra to check if there's more
    ...(options?.cursor && {
      cursor: { id: options.cursor },
      skip: 1, // Skip the cursor
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
 * Grant welcome bonus to a new user
 */
export async function grantWelcomeBonus(userId: string): Promise<void> {
  await grantTokens(
    userId,
    WELCOME_BONUS_TOKENS,
    "WELCOME_BONUS",
    `Welcome to Builders.to! Here's ${WELCOME_BONUS_TOKENS} tokens to get started.`
  );
}

/**
 * Grant referral reward to the referrer when a new user signs up
 */
export async function grantReferralReward(
  referrerId: string,
  refereeId: string,
  refereeName?: string
): Promise<void> {
  await grantTokens(
    referrerId,
    REFERRAL_REWARD_TOKENS,
    "REFERRAL_REWARD",
    `Referral bonus for ${refereeName || "a new user"} joining`,
    { refereeId, refereeName }
  );
}

/**
 * Grant engagement bonus for posting a daily update
 * Only grants if user hasn't received an engagement bonus today
 */
export async function grantEngagementBonus(userId: string): Promise<boolean> {
  // Check if user already received engagement bonus today
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const existingBonus = await prisma.tokenTransaction.findFirst({
    where: {
      userId,
      type: "ENGAGEMENT_BONUS",
      createdAt: { gte: today },
    },
  });

  if (existingBonus) {
    return false; // Already received today
  }

  await grantTokens(
    userId,
    ENGAGEMENT_BONUS_TOKENS,
    "ENGAGEMENT_BONUS",
    "Daily update posted"
  );

  return true;
}

/**
 * Check and grant streak bonus if user hits a milestone
 */
export async function checkAndGrantStreakBonus(
  userId: string,
  currentStreak: number
): Promise<{ granted: boolean; amount?: number; milestone?: number }> {
  // Check if this streak is a milestone
  const milestone = Object.keys(STREAK_MILESTONES)
    .map(Number)
    .find((m) => m === currentStreak);

  if (!milestone) {
    return { granted: false };
  }

  const amount = STREAK_MILESTONES[milestone as keyof typeof STREAK_MILESTONES];

  // Check if user already received this milestone bonus
  const existingBonus = await prisma.tokenTransaction.findFirst({
    where: {
      userId,
      type: "STREAK_BONUS",
      metadata: {
        path: ["milestone"],
        equals: milestone,
      },
    },
  });

  if (existingBonus) {
    return { granted: false }; // Already received this milestone
  }

  await grantTokens(
    userId,
    amount,
    "STREAK_BONUS",
    `${milestone}-day streak bonus!`,
    { milestone, streakDays: currentStreak }
  );

  return { granted: true, amount, milestone };
}

/**
 * Grant profile completion bonus when user reaches 100% profile completeness
 * Only grants once per user - checks if user has already received this bonus
 */
export async function grantProfileCompletionBonus(
  userId: string
): Promise<{ granted: boolean; amount: number }> {
  // Check if user already received profile completion bonus
  const existingBonus = await prisma.tokenTransaction.findFirst({
    where: {
      userId,
      type: "PROFILE_COMPLETION",
    },
  });

  if (existingBonus) {
    return { granted: false, amount: 0 }; // Already received this bonus
  }

  await grantTokens(
    userId,
    PROFILE_COMPLETION_TOKENS,
    "PROFILE_COMPLETION",
    "Profile 100% complete! 🎉"
  );

  return { granted: true, amount: PROFILE_COMPLETION_TOKENS };
}

/**
 * Get referral stats for a user
 */
export async function getReferralStats(userId: string): Promise<{
  totalReferrals: number;
  totalEarned: number;
  referrals: Array<{
    id: string;
    name: string | null;
    image: string | null;
    createdAt: Date;
  }>;
}> {
  // Get users referred by this user
  const referrals = await prisma.user.findMany({
    where: { referredById: userId },
    select: {
      id: true,
      name: true,
      image: true,
      createdAt: true,
    },
    orderBy: { createdAt: "desc" },
  });

  // Calculate total earned from referrals
  const earnings = await prisma.tokenTransaction.aggregate({
    where: {
      userId,
      type: "REFERRAL_REWARD",
    },
    _sum: { amount: true },
  });

  return {
    totalReferrals: referrals.length,
    totalEarned: earnings._sum.amount ?? 0,
    referrals,
  };
}

/**
 * Get token value in dollars
 */
export function tokensToDollars(tokens: number): number {
  return tokens / TOKENS_PER_DOLLAR;
}

/**
 * Get token cost for a dollar amount
 */
export function dollarsToTokens(dollars: number): number {
  return Math.ceil(dollars * TOKENS_PER_DOLLAR);
}

/**
 * Gift tokens from one user to another
 * This is for when a user pays to gift tokens to another user
 */
export async function giftTokens(
  senderId: string,
  recipientId: string,
  amount: number,
  senderName?: string,
  recipientName?: string,
  stripePaymentId?: string
): Promise<{ senderTransactionId: string; recipientTransactionId: string }> {
  if (amount <= 0) {
    throw new Error("Gift amount must be positive");
  }

  if (senderId === recipientId) {
    throw new Error("Cannot gift tokens to yourself");
  }

  // Use a transaction to ensure atomicity
  const result = await prisma.$transaction(async (tx) => {
    // Create transaction for sender (tokens they purchased to gift)
    const senderTransaction = await tx.tokenTransaction.create({
      data: {
        userId: senderId,
        amount: -amount, // Negative for spending/gifting
        type: "GIFT_SENT",
        description: `Gifted ${amount} tokens to ${recipientName || "another builder"}`,
        metadata: {
          recipientId,
          recipientName,
          stripePaymentId,
        },
      },
    });

    // Create transaction for recipient
    const recipientTransaction = await tx.tokenTransaction.create({
      data: {
        userId: recipientId,
        amount: amount, // Positive for receiving
        type: "GIFT_RECEIVED",
        description: `Received ${amount} tokens from ${senderName || "another builder"}`,
        metadata: {
          senderId,
          senderName,
          stripePaymentId,
        },
      },
    });

    // Update recipient's balance and lifetime tokens
    await tx.user.update({
      where: { id: recipientId },
      data: {
        tokenBalance: { increment: amount },
        lifetimeTokensEarned: { increment: amount },
      },
    });

    return {
      senderTransactionId: senderTransaction.id,
      recipientTransactionId: recipientTransaction.id,
    };
  });

  return result;
}
