import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import {
  getUserEarnings,
  getUserRewards,
  getRewardSettings,
  checkEligibility,
} from "@/lib/services/rewards.service";

/**
 * GET /api/rewards - Get current user's earnings and reward info
 */
export async function GET(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;

    // Get earnings info
    const earnings = await getUserEarnings(userId);

    // Get reward settings for display
    const settings = await getRewardSettings();

    // Get recent rewards
    const { rewards, total } = await getUserRewards(userId, { limit: 10 });

    // Check current eligibility (useful for UI feedback)
    const eligibility = await checkEligibility(userId, "a".repeat(settings.minCharCount));

    return NextResponse.json({
      earnings: earnings || {
        pendingAmount: 0,
        lifetimeEarnings: 0,
        earnedToday: false,
        lastPayoutAt: null,
        isPaused: false,
        isFlagged: false,
      },
      settings: {
        baseRewardCents: settings.baseRewardCents,
        maxBonusCents: settings.maxBonusCents,
        minCharCount: settings.minCharCount,
        maxPostsPerDay: settings.maxPostsPerDay,
        minPayoutCents: settings.minPayoutCents,
      },
      recentRewards: rewards,
      totalRewards: total,
      eligibility: {
        canEarnToday: eligibility.eligible,
        reason: eligibility.reason,
      },
    });
  } catch (error) {
    console.error("Error fetching rewards:", error);
    return NextResponse.json(
      { error: "Failed to fetch rewards" },
      { status: 500 }
    );
  }
}
