import { NextRequest, NextResponse } from "next/server";
import { processScheduledPosts } from "@/lib/services/posts.service";

// GET /api/cron/process-scheduled-posts - Process due scheduled posts
// This endpoint should be called by a cron job (e.g., every minute)
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

    await processScheduledPosts();

    return NextResponse.json({ 
      success: true,
      processedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Error processing scheduled posts:", error);
    return NextResponse.json(
      { error: "Failed to process scheduled posts" },
      { status: 500 }
    );
  }
}
