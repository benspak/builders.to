import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { generateContent, TonePreset, TONE_PRESETS } from "@/lib/services/openai.service";

// POST /api/agent/remix - Remix existing content
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
    const { content, tone, platform, action } = body;

    if (!content || content.trim().length === 0) {
      return NextResponse.json(
        { error: "Content is required" },
        { status: 400 }
      );
    }

    // Validate tone if provided
    if (tone && !Object.keys(TONE_PRESETS).includes(tone)) {
      return NextResponse.json(
        { error: "Invalid tone preset" },
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

    // Validate action
    const validActions = ["remix", "expand", "shorten", "improve"];
    const remixAction = validActions.includes(action) ? action : "remix";

    const result = await generateContent({
      tone: tone as TonePreset,
      platform,
      originalContent: content,
      action: remixAction as "remix" | "expand" | "shorten" | "improve",
    });

    return NextResponse.json({ result });
  } catch (error) {
    console.error("Error remixing content:", error);
    return NextResponse.json(
      { error: "Failed to remix content" },
      { status: 500 }
    );
  }
}
