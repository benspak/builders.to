import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

/**
 * POST /api/cron/expire-ads
 *
 * Mark advertisements as EXPIRED when their endDate has passed.
 * This endpoint should be called by a CRON job daily at 1 AM UTC.
 *
 * Security: Requires a secret token in the Authorization header
 * Set CRON_SECRET in your environment variables.
 */
export async function POST(request: NextRequest) {
  try {
    // Verify CRON secret
    const authHeader = request.headers.get("authorization");
    const cronSecret = process.env.CRON_SECRET;

    if (!cronSecret) {
      console.warn("CRON_SECRET not set - skipping authentication for development");
    } else if (authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const now = new Date();

    // Find and expire all active ads whose endDate has passed
    const result = await prisma.advertisement.updateMany({
      where: {
        status: "ACTIVE",
        endDate: { lt: now },
      },
      data: {
        status: "EXPIRED",
      },
    });

    console.log(`[Cron] Expired ${result.count} advertisements`);

    return NextResponse.json({
      success: true,
      message: `Expired ${result.count} advertisement${result.count !== 1 ? "s" : ""}`,
      expiredCount: result.count,
      timestamp: now.toISOString(),
    });
  } catch (error) {
    console.error("Error expiring ads:", error);
    return NextResponse.json(
      { error: "Failed to expire ads" },
      { status: 500 }
    );
  }
}

/**
 * GET /api/cron/expire-ads
 * Check how many ads are pending expiration (for debugging)
 */
export async function GET(request: NextRequest) {
  try {
    // Verify CRON secret
    const authHeader = request.headers.get("authorization");
    const cronSecret = process.env.CRON_SECRET;

    if (!cronSecret) {
      console.warn("CRON_SECRET not set - skipping authentication for development");
    } else if (authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const now = new Date();

    // Count ads that should be expired
    const pendingExpiration = await prisma.advertisement.count({
      where: {
        status: "ACTIVE",
        endDate: { lt: now },
      },
    });

    // Get counts by status
    const statusCounts = await prisma.advertisement.groupBy({
      by: ["status"],
      _count: true,
    });

    return NextResponse.json({
      status: "ready",
      stats: {
        pendingExpiration,
        byStatus: statusCounts.reduce(
          (acc, s) => ({ ...acc, [s.status]: s._count }),
          {} as Record<string, number>
        ),
      },
      note: "POST to this endpoint to expire ads (requires CRON_SECRET)",
    });
  } catch (error) {
    console.error("Error checking ad expiration status:", error);
    return NextResponse.json(
      { error: "Failed to check status" },
      { status: 500 }
    );
  }
}
