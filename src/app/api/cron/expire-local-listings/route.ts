import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

/**
 * POST /api/cron/expire-local-listings
 *
 * Mark local listings as EXPIRED when their expiresAt date has passed.
 * - Free listings expire after 30 days
 * - Paid SERVICES listings expire after 90 days
 * This endpoint should be called by a CRON job daily at 1:30 AM UTC.
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

    // Find and expire all active local listings whose expiresAt has passed
    const result = await prisma.localListing.updateMany({
      where: {
        status: "ACTIVE",
        expiresAt: { lt: now },
      },
      data: {
        status: "EXPIRED",
      },
    });

    console.log(`[Cron] Expired ${result.count} local listings`);

    return NextResponse.json({
      success: true,
      message: `Expired ${result.count} local listing${result.count !== 1 ? "s" : ""}`,
      expiredCount: result.count,
      timestamp: now.toISOString(),
    });
  } catch (error) {
    console.error("Error expiring local listings:", error);
    return NextResponse.json(
      { error: "Failed to expire local listings" },
      { status: 500 }
    );
  }
}

/**
 * GET /api/cron/expire-local-listings
 * Check how many local listings are pending expiration (for debugging)
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

    // Count local listings that should be expired
    const pendingExpiration = await prisma.localListing.count({
      where: {
        status: "ACTIVE",
        expiresAt: { lt: now },
      },
    });

    // Get counts by status
    const statusCounts = await prisma.localListing.groupBy({
      by: ["status"],
      _count: true,
    });

    // Get counts by category
    const categoryCounts = await prisma.localListing.groupBy({
      by: ["category"],
      where: { status: "ACTIVE" },
      _count: true,
    });

    // Get listings expiring in the next 7 days
    const nextWeek = new Date(now);
    nextWeek.setDate(nextWeek.getDate() + 7);

    const expiringThisWeek = await prisma.localListing.count({
      where: {
        status: "ACTIVE",
        expiresAt: {
          gte: now,
          lt: nextWeek,
        },
      },
    });

    return NextResponse.json({
      status: "ready",
      stats: {
        pendingExpiration,
        expiringThisWeek,
        byStatus: statusCounts.reduce(
          (acc, s) => ({ ...acc, [s.status]: s._count }),
          {} as Record<string, number>
        ),
        activeByCategory: categoryCounts.reduce(
          (acc, c) => ({ ...acc, [c.category]: c._count }),
          {} as Record<string, number>
        ),
      },
      note: "POST to this endpoint to expire local listings (requires CRON_SECRET)",
    });
  } catch (error) {
    console.error("Error checking local listing expiration status:", error);
    return NextResponse.json(
      { error: "Failed to check status" },
      { status: 500 }
    );
  }
}
