import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getSuggestionStats } from "@/lib/services/agent.service";

// GET /api/agent/suggestions/stats - Get suggestion statistics
export async function GET() {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const stats = await getSuggestionStats(session.user.id);

    return NextResponse.json({ stats });
  } catch (error) {
    console.error("Error fetching suggestion stats:", error);
    return NextResponse.json(
      { error: "Failed to fetch suggestion stats" },
      { status: 500 }
    );
  }
}
