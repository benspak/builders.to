import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { analyzeContent } from "@/lib/services/openai.service";

// POST /api/agent/analyze - Analyze content and get suggestions
export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { content, platform } = body;

    if (!content || content.trim().length === 0) {
      return NextResponse.json(
        { error: "Content is required" },
        { status: 400 }
      );
    }

    // Validate platform if provided
    const validPlatforms = ["TWITTER", "LINKEDIN", "BUILDERS"];
    if (platform && !validPlatforms.includes(platform)) {
      return NextResponse.json(
        { error: "Invalid platform" },
        { status: 400 }
      );
    }

    const analysis = await analyzeContent(content, platform);

    return NextResponse.json({ analysis });
  } catch (error) {
    console.error("Error analyzing content:", error);
    return NextResponse.json(
      { error: "Failed to analyze content" },
      { status: 500 }
    );
  }
}
