import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getUserPayouts, processPayout, getUserEarnings, getRewardSettings } from "@/lib/services/rewards.service";
import { RewardStatus } from "@prisma/client";

/**
 * GET /api/rewards/payouts - Get user's payout history
 */
export async function GET(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const limit = Math.min(parseInt(searchParams.get("limit") || "25"), 100);
    const offset = parseInt(searchParams.get("offset") || "0");
    const statusParam = searchParams.get("status");

    // Validate status if provided
    let status: RewardStatus | undefined;
    if (statusParam && Object.values(RewardStatus).includes(statusParam as RewardStatus)) {
      status = statusParam as RewardStatus;
    }

    const { payouts, total } = await getUserPayouts(session.user.id, {
      status,
      limit,
      offset,
    });

    return NextResponse.json({
      payouts,
      total,
      pagination: {
        limit,
        offset,
        hasMore: offset + payouts.length < total,
      },
    });
  } catch (error) {
    console.error("Error fetching payouts:", error);
    return NextResponse.json(
      { error: "Failed to fetch payouts" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/rewards/payouts - Request a manual payout (if above threshold)
 */
export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;

    // Check if user has enough pending balance
    const earnings = await getUserEarnings(userId);
    const settings = await getRewardSettings();

    if (!earnings) {
      return NextResponse.json(
        { error: "No earnings record found" },
        { status: 400 }
      );
    }

    if (earnings.isPaused) {
      return NextResponse.json(
        { error: "Your rewards are currently paused" },
        { status: 400 }
      );
    }

    if (earnings.isFlagged) {
      return NextResponse.json(
        { error: "Your account is under review" },
        { status: 400 }
      );
    }

    if (earnings.pendingAmount < settings.minPayoutCents) {
      return NextResponse.json(
        {
          error: `Minimum payout is $${(settings.minPayoutCents / 100).toFixed(2)}. You have $${(earnings.pendingAmount / 100).toFixed(2)} pending.`,
        },
        { status: 400 }
      );
    }

    if (settings.globalPayoutsPaused) {
      return NextResponse.json(
        { error: "Payouts are temporarily paused" },
        { status: 400 }
      );
    }

    // Process the payout
    const result = await processPayout(userId);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || "Payout failed" },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      payoutId: result.payoutId,
      message: `Payout of $${(earnings.pendingAmount / 100).toFixed(2)} initiated`,
    });
  } catch (error) {
    console.error("Error processing payout:", error);
    return NextResponse.json(
      { error: "Failed to process payout" },
      { status: 500 }
    );
  }
}
