import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { generateContentIdeas } from "@/lib/services/openai.service";

// GET /api/agent/ideas - Get AI-generated content ideas
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
    const count = parseInt(searchParams.get("count") || "5", 10);

    // Validate count
    const ideaCount = Math.min(Math.max(count, 1), 10);

    const ideas = await generateContentIdeas(session.user.id, ideaCount);

    return NextResponse.json({ ideas });
  } catch (error) {
    console.error("Error generating ideas:", error);
    return NextResponse.json(
      { error: "Failed to generate ideas" },
      { status: 500 }
    );
  }
}
