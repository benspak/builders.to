import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { generateContent, TonePreset, TONE_PRESETS } from "@/lib/services/openai.service";

// POST /api/agent/generate - Generate content using AI
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
    const { topic, tone, platform, context, interests } = body;

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

    const result = await generateContent({
      topic,
      tone: tone as TonePreset,
      platform,
      context,
      interests,
      action: "generate",
    });

    return NextResponse.json({ result });
  } catch (error) {
    console.error("Error generating content:", error);
    return NextResponse.json(
      { error: "Failed to generate content" },
      { status: 500 }
    );
  }
}
