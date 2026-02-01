import { NextRequest, NextResponse } from "next/server";
import { getKarmaLeaderboard } from "@/lib/services/karma.service";

// GET /api/karma/leaderboard - Get karma leaderboard
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get("limit") || "10", 10);
    const offset = parseInt(searchParams.get("offset") || "0", 10);

    // Cap limit at 50
    const cappedLimit = Math.min(limit, 50);

    const { users, total } = await getKarmaLeaderboard({
      limit: cappedLimit,
      offset,
    });

    return NextResponse.json({
      users,
      total,
      limit: cappedLimit,
      offset,
    });
  } catch (error) {
    console.error("Error fetching karma leaderboard:", error);
    return NextResponse.json(
      { error: "Failed to fetch karma leaderboard" },
      { status: 500 }
    );
  }
}
