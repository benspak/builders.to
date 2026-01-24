import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { SuggestionStatus } from "@prisma/client";
import { getUserSuggestions, getPendingSuggestionCount } from "@/lib/services/agent.service";

// GET /api/agent/suggestions - Get user's AI suggestions
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
    const status = searchParams.get("status") as SuggestionStatus | null;
    const limit = parseInt(searchParams.get("limit") || "25", 10);
    const offset = parseInt(searchParams.get("offset") || "0", 10);
    const countOnly = searchParams.get("countOnly") === "true";

    // If only count is requested
    if (countOnly) {
      const count = await getPendingSuggestionCount(session.user.id);
      return NextResponse.json({ pendingCount: count });
    }

    const suggestions = await getUserSuggestions(session.user.id, {
      status: status || undefined,
      limit: Math.min(limit, 50),
      offset,
    });

    return NextResponse.json({ suggestions });
  } catch (error) {
    console.error("Error fetching suggestions:", error);
    return NextResponse.json(
      { error: "Failed to fetch suggestions" },
      { status: 500 }
    );
  }
}
