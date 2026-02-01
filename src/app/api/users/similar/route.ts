import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { findSimilarBuilders } from "@/lib/services/matching.service";

// GET /api/users/similar - Get users building similar things
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
    const limit = parseInt(searchParams.get("limit") || "10", 10);
    const excludeFollowing = searchParams.get("excludeFollowing") !== "false";

    // Cap limit at 20
    const cappedLimit = Math.min(limit, 20);

    const similarUsers = await findSimilarBuilders({
      userId: session.user.id,
      limit: cappedLimit,
      excludeFollowing,
    });

    return NextResponse.json({
      users: similarUsers,
      total: similarUsers.length,
    });
  } catch (error) {
    console.error("Error finding similar builders:", error);
    return NextResponse.json(
      { error: "Failed to find similar builders" },
      { status: 500 }
    );
  }
}
