import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { generateSuggestionsForUser } from "@/lib/services/agent.service";

// POST /api/agent/suggestions/generate - Manually generate new suggestions
export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    let count = 3;
    try {
      const body = await request.json();
      if (body.count) {
        count = Math.min(Math.max(body.count, 1), 5);
      }
    } catch {
      // No body or invalid JSON is fine, use default count
    }

    const suggestions = await generateSuggestionsForUser(session.user.id, count);

    return NextResponse.json({ suggestions }, { status: 201 });
  } catch (error) {
    console.error("Error generating suggestions:", error);
    const message = error instanceof Error ? error.message : "Failed to generate suggestions";
    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}
