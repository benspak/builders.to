import { NextRequest, NextResponse } from "next/server";
import { getForecastLeaderboard } from "@/lib/coins";

/**
 * GET /api/forecasting/leaderboard
 * Get the forecasting leaderboard
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const sortBy = (searchParams.get("sortBy") || "accuracy") as
      | "accuracy"
      | "coins"
      | "total";
    const limit = parseInt(searchParams.get("limit") || "50");

    const leaderboard = await getForecastLeaderboard({
      sortBy,
      limit: Math.min(limit, 100), // Cap at 100
    });

    return NextResponse.json({
      leaderboard,
      sortBy,
    });
  } catch (error) {
    console.error("Error fetching leaderboard:", error);
    return NextResponse.json(
      { error: "Failed to fetch leaderboard" },
      { status: 500 }
    );
  }
}
