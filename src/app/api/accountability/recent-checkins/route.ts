import { NextRequest, NextResponse } from "next/server";
import { getRecentPublicCheckIns } from "@/lib/services/accountability.service";

// GET /api/accountability/recent-checkins - Public endpoint for recent check-ins
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get("limit") || "30", 10);
    const offset = parseInt(searchParams.get("offset") || "0", 10);

    const { checkIns, total } = await getRecentPublicCheckIns({
      limit: Math.min(limit, 50),
      offset,
    });

    return NextResponse.json({
      checkIns,
      total,
      limit,
      offset,
    });
  } catch (error) {
    console.error("Error fetching recent check-ins:", error);
    return NextResponse.json(
      { error: "Failed to fetch recent check-ins" },
      { status: 500 }
    );
  }
}
