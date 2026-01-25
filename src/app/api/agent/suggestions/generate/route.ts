import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { generateSuggestionsForUser } from "@/lib/services/agent.service";
import { TonePreset } from "@/lib/services/openai.service";

// Valid tone options
const VALID_TONES: TonePreset[] = ['professional', 'casual', 'witty', 'inspirational', 'educational', 'provocative'];

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
    let tone: TonePreset = 'professional';
    let customPrompt: string | undefined;

    try {
      const body = await request.json();
      if (body.count) {
        count = Math.min(Math.max(body.count, 1), 5);
      }
      if (body.tone && VALID_TONES.includes(body.tone)) {
        tone = body.tone;
      }
      if (body.customPrompt && typeof body.customPrompt === 'string') {
        // Limit custom prompt to 500 characters
        customPrompt = body.customPrompt.slice(0, 500).trim() || undefined;
      }
    } catch {
      // No body or invalid JSON is fine, use defaults
    }

    const suggestions = await generateSuggestionsForUser(session.user.id, count, {
      tone,
      customPrompt,
    });

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
