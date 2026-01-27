import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getUserRewards } from "@/lib/services/rewards.service";
import { RewardStatus } from "@prisma/client";

/**
 * GET /api/rewards/history - Get user's reward history with pagination
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

    const { rewards, total } = await getUserRewards(session.user.id, {
      status,
      limit,
      offset,
    });

    return NextResponse.json({
      rewards,
      total,
      pagination: {
        limit,
        offset,
        hasMore: offset + rewards.length < total,
      },
    });
  } catch (error) {
    console.error("Error fetching reward history:", error);
    return NextResponse.json(
      { error: "Failed to fetch reward history" },
      { status: 500 }
    );
  }
}
