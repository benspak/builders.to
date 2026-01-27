import crypto from "crypto";
import { RewardStatus, RewardType } from "@prisma/client";
import prisma from "@/lib/prisma";
import { getStripe } from "@/lib/stripe";
import { isProMember } from "@/lib/stripe-subscription";

/**
 * Pro User Rewards Service
 *
 * Handles:
 * - Calculating and awarding post rewards ($0.05 base + engagement bonus)
 * - Duplicate content detection
 * - Engagement bonus tracking (real-time updates on likes)
 * - Automatic payouts at $5 threshold via Stripe Transfers
 * - Admin controls (pause, flag, adjust rates)
 */

// ============================================
// Constants & Types
// ============================================

export interface RewardSettings {
  baseRewardCents: number;
  engagementBonusCents: number;
  likesPerTier: number;
  maxBonusCents: number;
  minCharCount: number;
  maxPostsPerDay: number;
  minPayoutCents: number;
  globalPayoutsPaused: boolean;
}

export interface UserEarningsInfo {
  pendingAmount: number;
  lifetimeEarnings: number;
  earnedToday: boolean;
  lastPayoutAt: Date | null;
  isPaused: boolean;
  isFlagged: boolean;
}

export interface EligibilityResult {
  eligible: boolean;
  reason?: string;
}

// Default settings (used if no settings exist in DB)
const DEFAULT_SETTINGS: RewardSettings = {
  baseRewardCents: 5, // $0.05
  engagementBonusCents: 1, // $0.005 per tier (stored as 0.5 cents, use decimal in code)
  likesPerTier: 5,
  maxBonusCents: 2, // $0.02 max
  minCharCount: 100,
  maxPostsPerDay: 1,
  minPayoutCents: 500, // $5
  globalPayoutsPaused: false,
};

// ============================================
// Settings Management
// ============================================

/**
 * Get current reward settings
 */
export async function getRewardSettings(): Promise<RewardSettings> {
  const settings = await prisma.rewardSettings.findUnique({
    where: { id: "default" },
  });

  if (!settings) {
    return DEFAULT_SETTINGS;
  }

  return {
    baseRewardCents: settings.baseRewardCents,
    engagementBonusCents: settings.engagementBonusCents,
    likesPerTier: settings.likesPerTier,
    maxBonusCents: settings.maxBonusCents,
    minCharCount: settings.minCharCount,
    maxPostsPerDay: settings.maxPostsPerDay,
    minPayoutCents: settings.minPayoutCents,
    globalPayoutsPaused: settings.globalPayoutsPaused,
  };
}

/**
 * Update reward settings (admin only)
 */
export async function updateRewardSettings(
  updates: Partial<RewardSettings>
): Promise<RewardSettings> {
  const settings = await prisma.rewardSettings.upsert({
    where: { id: "default" },
    create: {
      id: "default",
      ...DEFAULT_SETTINGS,
      ...updates,
    },
    update: updates,
  });

  return {
    baseRewardCents: settings.baseRewardCents,
    engagementBonusCents: settings.engagementBonusCents,
    likesPerTier: settings.likesPerTier,
    maxBonusCents: settings.maxBonusCents,
    minCharCount: settings.minCharCount,
    maxPostsPerDay: settings.maxPostsPerDay,
    minPayoutCents: settings.minPayoutCents,
    globalPayoutsPaused: settings.globalPayoutsPaused,
  };
}

// ============================================
// Duplicate Detection
// ============================================

/**
 * Normalize content for hashing (lowercase, trim whitespace, remove punctuation)
 */
function normalizeContent(content: string): string {
  return content
    .toLowerCase()
    .replace(/[^\w\s]/g, "") // Remove punctuation
    .replace(/\s+/g, " ") // Normalize whitespace
    .trim();
}

/**
 * Generate SHA-256 hash of normalized content
 */
function hashContent(content: string): string {
  const normalized = normalizeContent(content);
  return crypto.createHash("sha256").update(normalized).digest("hex");
}

/**
 * Check if content is a duplicate of any previous post by this user
 */
export async function isDuplicateContent(
  userId: string,
  content: string
): Promise<boolean> {
  const hash = hashContent(content);

  const existing = await prisma.postContentHash.findUnique({
    where: {
      userId_hash: {
        userId,
        hash,
      },
    },
  });

  return !!existing;
}

/**
 * Store content hash for duplicate detection
 */
async function storeContentHash(userId: string, content: string): Promise<void> {
  const hash = hashContent(content);

  await prisma.postContentHash.create({
    data: {
      userId,
      hash,
    },
  });
}

// ============================================
// Eligibility Checks
// ============================================

/**
 * Check if user has Stripe Connect set up and onboarded
 */
export async function hasStripeConnect(userId: string): Promise<boolean> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      stripeConnectId: true,
      stripeConnectOnboarded: true,
    },
  });

  return !!(user?.stripeConnectId && user?.stripeConnectOnboarded);
}

/**
 * Check if user has already earned their daily reward
 */
export async function hasEarnedToday(userId: string): Promise<boolean> {
  const earnings = await prisma.userEarnings.findUnique({
    where: { userId },
    select: {
      earnedToday: true,
      lastPostDate: true,
    },
  });

  if (!earnings) {
    return false;
  }

  // Check if lastPostDate is today
  if (earnings.lastPostDate) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const lastPost = new Date(earnings.lastPostDate);
    lastPost.setHours(0, 0, 0, 0);

    if (lastPost.getTime() === today.getTime()) {
      return earnings.earnedToday;
    }
  }

  // If lastPostDate is not today, reset earnedToday
  return false;
}

/**
 * Check if user's earnings are paused or flagged
 */
export async function isUserPausedOrFlagged(userId: string): Promise<{
  isPaused: boolean;
  isFlagged: boolean;
}> {
  const earnings = await prisma.userEarnings.findUnique({
    where: { userId },
    select: {
      isPaused: true,
      isFlagged: true,
    },
  });

  return {
    isPaused: earnings?.isPaused ?? false,
    isFlagged: earnings?.isFlagged ?? false,
  };
}

/**
 * Full eligibility check for post rewards
 */
export async function checkEligibility(
  userId: string,
  content: string
): Promise<EligibilityResult> {
  const settings = await getRewardSettings();

  // Check if payouts are globally paused
  if (settings.globalPayoutsPaused) {
    return { eligible: false, reason: "Rewards are currently paused" };
  }

  // Check Pro membership
  const isPro = await isProMember(userId);
  if (!isPro) {
    return { eligible: false, reason: "Pro membership required" };
  }

  // Check Stripe Connect
  const hasConnect = await hasStripeConnect(userId);
  if (!hasConnect) {
    return { eligible: false, reason: "Stripe Connect setup required" };
  }

  // Check if user is paused or flagged
  const { isPaused, isFlagged } = await isUserPausedOrFlagged(userId);
  if (isPaused) {
    return { eligible: false, reason: "Rewards paused by admin" };
  }
  if (isFlagged) {
    return { eligible: false, reason: "Account flagged for review" };
  }

  // Check character count
  if (content.length < settings.minCharCount) {
    return {
      eligible: false,
      reason: `Post must be at least ${settings.minCharCount} characters`,
    };
  }

  // Check daily limit
  const earnedToday = await hasEarnedToday(userId);
  if (earnedToday) {
    return { eligible: false, reason: "Daily reward limit reached" };
  }

  // Check for duplicate content
  const isDuplicate = await isDuplicateContent(userId, content);
  if (isDuplicate) {
    return { eligible: false, reason: "Duplicate content not eligible" };
  }

  return { eligible: true };
}

// ============================================
// Reward Calculation & Creation
// ============================================

/**
 * Calculate engagement bonus based on likes
 * Uses gradual accrual: +$0.005 per 5 likes, capped at $0.02
 */
export function calculateEngagementBonus(
  likeCount: number,
  settings: RewardSettings
): number {
  const tiers = Math.floor(likeCount / settings.likesPerTier);
  // engagementBonusCents is stored as whole cents but represents 0.5 cents per tier
  // So 1 cent stored = 0.5 cents actual per tier
  const bonusCents = tiers * (settings.engagementBonusCents * 0.5);
  return Math.min(bonusCents, settings.maxBonusCents);
}

/**
 * Create base post reward for an eligible post
 * Returns the created reward or null if not eligible
 */
export async function createPostReward(
  userId: string,
  dailyUpdateId: string,
  content: string
): Promise<{ success: boolean; rewardId?: string; reason?: string }> {
  // Check eligibility
  const eligibility = await checkEligibility(userId, content);
  if (!eligibility.eligible) {
    return { success: false, reason: eligibility.reason };
  }

  const settings = await getRewardSettings();

  // Use transaction for atomic operations
  const result = await prisma.$transaction(async (tx) => {
    // Store content hash
    const hash = hashContent(content);
    await tx.postContentHash.create({
      data: { userId, hash },
    });

    // Create base reward
    const reward = await tx.postReward.create({
      data: {
        userId,
        dailyUpdateId,
        type: RewardType.BASE_POST,
        amount: settings.baseRewardCents,
        status: RewardStatus.PENDING,
      },
    });

    // Update user earnings
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    await tx.userEarnings.upsert({
      where: { userId },
      create: {
        userId,
        pendingAmount: settings.baseRewardCents,
        lifetimeEarnings: settings.baseRewardCents,
        earnedToday: true,
        lastPostDate: today,
      },
      update: {
        pendingAmount: { increment: settings.baseRewardCents },
        lifetimeEarnings: { increment: settings.baseRewardCents },
        earnedToday: true,
        lastPostDate: today,
      },
    });

    return reward;
  });

  // Check if auto-payout should be triggered
  await checkAndTriggerPayout(userId);

  return { success: true, rewardId: result.id };
}

/**
 * Update engagement bonus for a post when likes change
 * This recalculates and updates the bonus reward
 */
export async function updateEngagementBonus(
  dailyUpdateId: string
): Promise<void> {
  // Get the daily update with like count and existing rewards
  const update = await prisma.dailyUpdate.findUnique({
    where: { id: dailyUpdateId },
    include: {
      likes: true,
      rewards: {
        where: {
          type: RewardType.BASE_POST,
          status: RewardStatus.PENDING,
        },
      },
    },
  });

  if (!update || update.rewards.length === 0) {
    // No base reward means this post isn't eligible for bonuses
    return;
  }

  const baseReward = update.rewards[0];
  const settings = await getRewardSettings();
  const likeCount = update.likes.length;

  // Calculate new bonus
  const newBonusCents = calculateEngagementBonus(likeCount, settings);

  // Get existing engagement bonus reward
  const existingBonus = await prisma.postReward.findFirst({
    where: {
      dailyUpdateId,
      type: RewardType.ENGAGEMENT_BONUS,
      status: RewardStatus.PENDING,
    },
  });

  const oldBonusCents = existingBonus?.amount ?? 0;
  const bonusDiff = newBonusCents - oldBonusCents;

  if (bonusDiff === 0) {
    return; // No change needed
  }

  await prisma.$transaction(async (tx) => {
    if (existingBonus) {
      // Update existing bonus
      await tx.postReward.update({
        where: { id: existingBonus.id },
        data: { amount: newBonusCents },
      });
    } else if (newBonusCents > 0) {
      // Create new bonus reward
      await tx.postReward.create({
        data: {
          userId: baseReward.userId,
          dailyUpdateId,
          type: RewardType.ENGAGEMENT_BONUS,
          amount: newBonusCents,
          status: RewardStatus.PENDING,
        },
      });
    }

    // Update user earnings with the difference
    if (bonusDiff !== 0) {
      await tx.userEarnings.update({
        where: { userId: baseReward.userId },
        data: {
          pendingAmount: { increment: bonusDiff },
          lifetimeEarnings: { increment: bonusDiff > 0 ? bonusDiff : 0 },
        },
      });
    }
  });

  // Check if auto-payout should be triggered
  await checkAndTriggerPayout(baseReward.userId);
}

// ============================================
// User Earnings
// ============================================

/**
 * Get user's earnings info
 */
export async function getUserEarnings(
  userId: string
): Promise<UserEarningsInfo | null> {
  const earnings = await prisma.userEarnings.findUnique({
    where: { userId },
  });

  if (!earnings) {
    return null;
  }

  return {
    pendingAmount: earnings.pendingAmount,
    lifetimeEarnings: earnings.lifetimeEarnings,
    earnedToday: earnings.earnedToday,
    lastPayoutAt: earnings.lastPayoutAt,
    isPaused: earnings.isPaused,
    isFlagged: earnings.isFlagged,
  };
}

/**
 * Get user's reward history
 */
export async function getUserRewards(
  userId: string,
  options: {
    status?: RewardStatus;
    limit?: number;
    offset?: number;
  } = {}
): Promise<{
  rewards: Array<{
    id: string;
    type: RewardType;
    amount: number;
    status: RewardStatus;
    createdAt: Date;
    dailyUpdateId: string;
  }>;
  total: number;
}> {
  const { status, limit = 25, offset = 0 } = options;

  const where = {
    userId,
    ...(status && { status }),
  };

  const [rewards, total] = await Promise.all([
    prisma.postReward.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take: limit,
      skip: offset,
      select: {
        id: true,
        type: true,
        amount: true,
        status: true,
        createdAt: true,
        dailyUpdateId: true,
      },
    }),
    prisma.postReward.count({ where }),
  ]);

  return { rewards, total };
}

// ============================================
// Payout System
// ============================================

/**
 * Check if user meets payout threshold and trigger if so
 */
export async function checkAndTriggerPayout(userId: string): Promise<void> {
  const settings = await getRewardSettings();

  if (settings.globalPayoutsPaused) {
    return;
  }

  const earnings = await prisma.userEarnings.findUnique({
    where: { userId },
    select: {
      pendingAmount: true,
      isPaused: true,
      isFlagged: true,
    },
  });

  if (!earnings || earnings.isPaused || earnings.isFlagged) {
    return;
  }

  if (earnings.pendingAmount >= settings.minPayoutCents) {
    await processPayout(userId);
  }
}

/**
 * Process automatic payout to user
 */
export async function processPayout(userId: string): Promise<{
  success: boolean;
  payoutId?: string;
  error?: string;
}> {
  // Get user with Stripe Connect info
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      stripeConnectId: true,
      stripeConnectOnboarded: true,
    },
  });

  if (!user?.stripeConnectId || !user?.stripeConnectOnboarded) {
    return { success: false, error: "Stripe Connect not set up" };
  }

  // Get pending rewards
  const pendingRewards = await prisma.postReward.findMany({
    where: {
      userId,
      status: RewardStatus.PENDING,
    },
  });

  if (pendingRewards.length === 0) {
    return { success: false, error: "No pending rewards" };
  }

  const totalAmount = pendingRewards.reduce((sum, r) => sum + r.amount, 0);

  // Create payout record
  const payout = await prisma.payout.create({
    data: {
      userId,
      amount: totalAmount,
      status: RewardStatus.PROCESSING,
    },
  });

  try {
    const stripe = getStripe();

    // Create Stripe Transfer to connected account
    const transfer = await stripe.transfers.create({
      amount: totalAmount,
      currency: "usd",
      destination: user.stripeConnectId,
      transfer_group: `payout_${payout.id}`,
      metadata: {
        payoutId: payout.id,
        userId,
        rewardCount: pendingRewards.length.toString(),
      },
      description: `Builders.to creator payout - ${pendingRewards.length} rewards`,
    });

    // Update payout and rewards in transaction
    await prisma.$transaction(async (tx) => {
      // Mark payout as paid
      await tx.payout.update({
        where: { id: payout.id },
        data: {
          status: RewardStatus.PAID,
          stripeTransferId: transfer.id,
          completedAt: new Date(),
        },
      });

      // Mark rewards as paid
      await tx.postReward.updateMany({
        where: {
          id: { in: pendingRewards.map((r) => r.id) },
        },
        data: {
          status: RewardStatus.PAID,
          payoutId: payout.id,
        },
      });

      // Reset pending amount
      await tx.userEarnings.update({
        where: { userId },
        data: {
          pendingAmount: 0,
          lastPayoutAt: new Date(),
        },
      });
    });

    console.log(
      `[Rewards] Payout ${payout.id} completed: $${(totalAmount / 100).toFixed(2)} to user ${userId}`
    );

    return { success: true, payoutId: payout.id };
  } catch (error) {
    console.error("[Rewards] Payout failed:", error);

    // Mark payout as failed
    await prisma.payout.update({
      where: { id: payout.id },
      data: {
        status: RewardStatus.FAILED,
        failureReason:
          error instanceof Error ? error.message : "Unknown error",
      },
    });

    return {
      success: false,
      payoutId: payout.id,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Get payout history for a user
 */
export async function getUserPayouts(
  userId: string,
  options: {
    status?: RewardStatus;
    limit?: number;
    offset?: number;
  } = {}
): Promise<{
  payouts: Array<{
    id: string;
    amount: number;
    status: RewardStatus;
    createdAt: Date;
    completedAt: Date | null;
    stripeTransferId: string | null;
  }>;
  total: number;
}> {
  const { status, limit = 25, offset = 0 } = options;

  const where = {
    userId,
    ...(status && { status }),
  };

  const [payouts, total] = await Promise.all([
    prisma.payout.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take: limit,
      skip: offset,
      select: {
        id: true,
        amount: true,
        status: true,
        createdAt: true,
        completedAt: true,
        stripeTransferId: true,
      },
    }),
    prisma.payout.count({ where }),
  ]);

  return { payouts, total };
}

// ============================================
// Admin Functions
// ============================================

/**
 * Pause user's rewards
 */
export async function pauseUserRewards(
  userId: string,
  adminNote?: string
): Promise<void> {
  await prisma.userEarnings.upsert({
    where: { userId },
    create: {
      userId,
      isPaused: true,
    },
    update: {
      isPaused: true,
    },
  });

  console.log(`[Rewards Admin] Paused rewards for user ${userId}: ${adminNote || "No note"}`);
}

/**
 * Resume user's rewards
 */
export async function resumeUserRewards(userId: string): Promise<void> {
  await prisma.userEarnings.update({
    where: { userId },
    data: { isPaused: false },
  });

  console.log(`[Rewards Admin] Resumed rewards for user ${userId}`);
}

/**
 * Flag user for fraud review
 */
export async function flagUser(userId: string, reason: string): Promise<void> {
  await prisma.userEarnings.upsert({
    where: { userId },
    create: {
      userId,
      isFlagged: true,
      flagReason: reason,
    },
    update: {
      isFlagged: true,
      flagReason: reason,
    },
  });

  console.log(`[Rewards Admin] Flagged user ${userId}: ${reason}`);
}

/**
 * Unflag user
 */
export async function unflagUser(userId: string): Promise<void> {
  await prisma.userEarnings.update({
    where: { userId },
    data: {
      isFlagged: false,
      flagReason: null,
    },
  });

  console.log(`[Rewards Admin] Unflagged user ${userId}`);
}

/**
 * Cancel pending rewards for a user
 */
export async function cancelUserPendingRewards(
  userId: string,
  reason: string
): Promise<number> {
  const result = await prisma.$transaction(async (tx) => {
    // Get pending rewards
    const pendingRewards = await tx.postReward.findMany({
      where: {
        userId,
        status: RewardStatus.PENDING,
      },
    });

    if (pendingRewards.length === 0) {
      return 0;
    }

    const totalCancelled = pendingRewards.reduce((sum, r) => sum + r.amount, 0);

    // Cancel rewards
    await tx.postReward.updateMany({
      where: {
        id: { in: pendingRewards.map((r) => r.id) },
      },
      data: {
        status: RewardStatus.CANCELLED,
      },
    });

    // Update earnings
    await tx.userEarnings.update({
      where: { userId },
      data: {
        pendingAmount: 0,
        // Don't deduct from lifetimeEarnings - those were earned
      },
    });

    return pendingRewards.length;
  });

  console.log(
    `[Rewards Admin] Cancelled ${result} pending rewards for user ${userId}: ${reason}`
  );

  return result;
}

/**
 * Get admin dashboard stats
 */
export async function getAdminStats(): Promise<{
  totalPendingAmount: number;
  totalLifetimeEarnings: number;
  totalPayouts: number;
  totalPayoutAmount: number;
  activeEarners: number;
  pausedUsers: number;
  flaggedUsers: number;
}> {
  const [earningsAgg, payoutsAgg, pausedCount, flaggedCount] = await Promise.all([
    prisma.userEarnings.aggregate({
      _sum: {
        pendingAmount: true,
        lifetimeEarnings: true,
      },
      _count: {
        _all: true,
      },
    }),
    prisma.payout.aggregate({
      where: { status: RewardStatus.PAID },
      _sum: { amount: true },
      _count: { _all: true },
    }),
    prisma.userEarnings.count({ where: { isPaused: true } }),
    prisma.userEarnings.count({ where: { isFlagged: true } }),
  ]);

  return {
    totalPendingAmount: earningsAgg._sum.pendingAmount ?? 0,
    totalLifetimeEarnings: earningsAgg._sum.lifetimeEarnings ?? 0,
    totalPayouts: payoutsAgg._count._all,
    totalPayoutAmount: payoutsAgg._sum.amount ?? 0,
    activeEarners: earningsAgg._count._all,
    pausedUsers: pausedCount,
    flaggedUsers: flaggedCount,
  };
}

/**
 * Get all users with earnings (for admin panel)
 */
export async function getAllUserEarnings(options: {
  limit?: number;
  offset?: number;
  filter?: "all" | "paused" | "flagged" | "hasBalance";
}): Promise<{
  users: Array<{
    userId: string;
    user: { name: string | null; email: string | null; slug: string | null };
    pendingAmount: number;
    lifetimeEarnings: number;
    isPaused: boolean;
    isFlagged: boolean;
    flagReason: string | null;
    lastPayoutAt: Date | null;
  }>;
  total: number;
}> {
  const { limit = 50, offset = 0, filter = "all" } = options;

  const where = {
    ...(filter === "paused" && { isPaused: true }),
    ...(filter === "flagged" && { isFlagged: true }),
    ...(filter === "hasBalance" && { pendingAmount: { gt: 0 } }),
  };

  const [users, total] = await Promise.all([
    prisma.userEarnings.findMany({
      where,
      orderBy: { lifetimeEarnings: "desc" },
      take: limit,
      skip: offset,
      include: {
        user: {
          select: {
            name: true,
            email: true,
            slug: true,
          },
        },
      },
    }),
    prisma.userEarnings.count({ where }),
  ]);

  return {
    users: users.map((e) => ({
      userId: e.userId,
      user: e.user,
      pendingAmount: e.pendingAmount,
      lifetimeEarnings: e.lifetimeEarnings,
      isPaused: e.isPaused,
      isFlagged: e.isFlagged,
      flagReason: e.flagReason,
      lastPayoutAt: e.lastPayoutAt,
    })),
    total,
  };
}

// ============================================
// Daily Reset (for cron job)
// ============================================

/**
 * Reset daily earning flags for all users
 * Should be called at midnight UTC by a cron job
 */
export async function resetDailyEarnings(): Promise<number> {
  const result = await prisma.userEarnings.updateMany({
    where: { earnedToday: true },
    data: { earnedToday: false },
  });

  console.log(`[Rewards] Reset daily earnings for ${result.count} users`);
  return result.count;
}
