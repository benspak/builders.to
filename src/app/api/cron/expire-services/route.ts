import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

/**
 * POST /api/cron/expire-services
 *
 * Mark service listings as EXPIRED when their expiresAt date has passed.
 * Service listings expire 90 days from activation.
 * This endpoint should be called by a CRON job daily at 1:15 AM UTC.
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

    // Find and expire all active service listings whose expiresAt has passed
    const result = await prisma.serviceListing.updateMany({
      where: {
        status: "ACTIVE",
        expiresAt: { lt: now },
      },
      data: {
        status: "EXPIRED",
      },
    });

    console.log(`[Cron] Expired ${result.count} service listings`);

    return NextResponse.json({
      success: true,
      message: `Expired ${result.count} service listing${result.count !== 1 ? "s" : ""}`,
      expiredCount: result.count,
      timestamp: now.toISOString(),
    });
  } catch (error) {
    console.error("Error expiring service listings:", error);
    return NextResponse.json(
      { error: "Failed to expire service listings" },
      { status: 500 }
    );
  }
}

/**
 * GET /api/cron/expire-services
 * Check how many service listings are pending expiration (for debugging)
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

    // Count service listings that should be expired
    const pendingExpiration = await prisma.serviceListing.count({
      where: {
        status: "ACTIVE",
        expiresAt: { lt: now },
      },
    });

    // Get counts by status
    const statusCounts = await prisma.serviceListing.groupBy({
      by: ["status"],
      _count: true,
    });

    // Get services expiring in the next 7 days
    const nextWeek = new Date(now);
    nextWeek.setDate(nextWeek.getDate() + 7);

    const expiringThisWeek = await prisma.serviceListing.count({
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
      },
      note: "POST to this endpoint to expire services (requires CRON_SECRET)",
    });
  } catch (error) {
    console.error("Error checking service listing expiration status:", error);
    return NextResponse.json(
      { error: "Failed to check status" },
      { status: 500 }
    );
  }
}
