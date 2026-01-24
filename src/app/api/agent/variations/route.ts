import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { generateContentVariations, TonePreset, TONE_PRESETS } from "@/lib/services/openai.service";

// POST /api/agent/variations - Generate multiple content variations
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
    const { topic, tone, platform, context, interests, count } = body;

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

    // Validate count
    const variationCount = Math.min(Math.max(count || 3, 1), 5);

    const variations = await generateContentVariations(
      {
        topic,
        tone: tone as TonePreset,
        platform,
        context,
        interests,
      },
      variationCount
    );

    return NextResponse.json({ variations });
  } catch (error) {
    console.error("Error generating variations:", error);
    return NextResponse.json(
      { error: "Failed to generate variations" },
      { status: 500 }
    );
  }
}
