import { NextResponse } from "next/server";
import { resetDailyEarnings } from "@/lib/services/rewards.service";

/**
 * POST /api/cron/reset-daily-rewards
 * Cron job to reset daily earnings flags
 * Should be called at midnight UTC daily
 *
 * Protected by CRON_SECRET environment variable
 */
export async function POST(request: Request) {
  try {
    // Verify cron secret
    const authHeader = request.headers.get("authorization");
    const cronSecret = process.env.CRON_SECRET;

    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const count = await resetDailyEarnings();

    console.log(`[Cron] Reset daily earnings for ${count} users`);

    return NextResponse.json({
      success: true,
      message: `Reset daily earnings for ${count} users`,
    });
  } catch (error) {
    console.error("[Cron] Error resetting daily earnings:", error);
    return NextResponse.json(
      { error: "Failed to reset daily earnings" },
      { status: 500 }
    );
  }
}

// Also support GET for easier testing/manual trigger
export async function GET(request: Request) {
  return POST(request);
}
