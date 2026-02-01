import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getKarmaHistory } from "@/lib/services/karma.service";

// GET /api/karma/history - Get current user's karma history
export async function GET(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get("limit") || "20", 10);
    const offset = parseInt(searchParams.get("offset") || "0", 10);

    // Cap limit at 50
    const cappedLimit = Math.min(limit, 50);

    const { events, total } = await getKarmaHistory(session.user.id, {
      limit: cappedLimit,
      offset,
    });

    return NextResponse.json({
      events,
      total,
      limit: cappedLimit,
      offset,
    });
  } catch (error) {
    console.error("Error fetching karma history:", error);
    return NextResponse.json(
      { error: "Failed to fetch karma history" },
      { status: 500 }
    );
  }
}
