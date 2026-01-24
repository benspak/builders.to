import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { SuggestionStatus } from "@prisma/client";
import { generateSuggestionsForUser } from "@/lib/services/agent.service";

// GET /api/cron/generate-suggestions - Generate suggestions for Pro users
// This endpoint should be called by a cron job (e.g., every 6 hours)
export async function GET(request: NextRequest) {
  try {
    // Verify cron secret to prevent unauthorized access
    const authHeader = request.headers.get("authorization");
    const cronSecret = process.env.CRON_SECRET;

    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Get all Pro users who have auto-suggestions enabled
    const proUsers = await prisma.user.findMany({
      where: {
        proSubscription: {
          status: "ACTIVE",
        },
        aiProfile: {
          autoSuggest: true,
        },
      },
      select: {
        id: true,
        aiProfile: true,
      },
    });

    const results: { userId: string; generated: number; error?: string }[] = [];

    for (const user of proUsers) {
      try {
        // Check how many pending suggestions the user has
        const pendingCount = await prisma.agentSuggestion.count({
          where: {
            userId: user.id,
            status: SuggestionStatus.PENDING,
          },
        });

        // Only generate if user has fewer than 3 pending suggestions
        const MIN_PENDING = 3;
        if (pendingCount < MIN_PENDING) {
          const toGenerate = MIN_PENDING - pendingCount;
          const suggestions = await generateSuggestionsForUser(user.id, toGenerate);
          results.push({ userId: user.id, generated: suggestions.length });
        } else {
          results.push({ userId: user.id, generated: 0 });
        }
      } catch (error) {
        console.error(`Error generating suggestions for user ${user.id}:`, error);
        results.push({ 
          userId: user.id, 
          generated: 0, 
          error: error instanceof Error ? error.message : "Unknown error",
        });
      }
    }

    return NextResponse.json({ 
      success: true,
      processedAt: new Date().toISOString(),
      usersProcessed: proUsers.length,
      results,
    });
  } catch (error) {
    console.error("Error generating suggestions:", error);
    return NextResponse.json(
      { error: "Failed to generate suggestions" },
      { status: 500 }
    );
  }
}
