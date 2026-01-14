import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

/**
 * POST /api/cron/cleanup
 *
 * Clean up old data to keep database size manageable:
 * - Old read notifications (> 90 days)
 * - Expired sessions (handled by NextAuth but we can clean up orphans)
 * - Old view/click tracking data (> 1 year)
 *
 * This endpoint should be called by a CRON job weekly on Saturday at 3 AM UTC.
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
    const results: Record<string, number> = {};

    // 1. Delete old read notifications (> 90 days old)
    const ninetyDaysAgo = new Date(now);
    ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);

    const deletedNotifications = await prisma.notification.deleteMany({
      where: {
        read: true,
        createdAt: { lt: ninetyDaysAgo },
      },
    });
    results.deletedNotifications = deletedNotifications.count;
    console.log(`[Cron] Deleted ${deletedNotifications.count} old notifications`);

    // 2. Delete expired sessions (past their expiry date)
    const deletedSessions = await prisma.session.deleteMany({
      where: {
        expires: { lt: now },
      },
    });
    results.deletedSessions = deletedSessions.count;
    console.log(`[Cron] Deleted ${deletedSessions.count} expired sessions`);

    // 3. Delete expired verification tokens
    const deletedVerificationTokens = await prisma.verificationToken.deleteMany({
      where: {
        expires: { lt: now },
      },
    });
    results.deletedVerificationTokens = deletedVerificationTokens.count;
    console.log(`[Cron] Deleted ${deletedVerificationTokens.count} expired verification tokens`);

    // 4. Delete old site view tracking data (> 1 year)
    const oneYearAgo = new Date(now);
    oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);

    const deletedSiteViews = await prisma.siteView.deleteMany({
      where: {
        createdAt: { lt: oneYearAgo },
      },
    });
    results.deletedSiteViews = deletedSiteViews.count;
    console.log(`[Cron] Deleted ${deletedSiteViews.count} old site views`);

    // 5. Delete old project view tracking data (> 1 year)
    const deletedProjectViews = await prisma.projectView.deleteMany({
      where: {
        createdAt: { lt: oneYearAgo },
      },
    });
    results.deletedProjectViews = deletedProjectViews.count;
    console.log(`[Cron] Deleted ${deletedProjectViews.count} old project views`);

    // 6. Delete old project click tracking data (> 1 year)
    const deletedProjectClicks = await prisma.projectClick.deleteMany({
      where: {
        createdAt: { lt: oneYearAgo },
      },
    });
    results.deletedProjectClicks = deletedProjectClicks.count;
    console.log(`[Cron] Deleted ${deletedProjectClicks.count} old project clicks`);

    // 7. Delete old update view tracking data (> 1 year)
    const deletedUpdateViews = await prisma.updateView.deleteMany({
      where: {
        createdAt: { lt: oneYearAgo },
      },
    });
    results.deletedUpdateViews = deletedUpdateViews.count;
    console.log(`[Cron] Deleted ${deletedUpdateViews.count} old update views`);

    // 8. Delete old local listing view tracking data (> 1 year)
    const deletedListingViews = await prisma.localListingView.deleteMany({
      where: {
        createdAt: { lt: oneYearAgo },
      },
    });
    results.deletedListingViews = deletedListingViews.count;
    console.log(`[Cron] Deleted ${deletedListingViews.count} old listing views`);

    // 9. Delete old local listing click tracking data (> 1 year)
    const deletedListingClicks = await prisma.localListingClick.deleteMany({
      where: {
        createdAt: { lt: oneYearAgo },
      },
    });
    results.deletedListingClicks = deletedListingClicks.count;
    console.log(`[Cron] Deleted ${deletedListingClicks.count} old listing clicks`);

    // 10. Delete old ad view tracking data (> 1 year)
    const deletedAdViews = await prisma.adView.deleteMany({
      where: {
        createdAt: { lt: oneYearAgo },
      },
    });
    results.deletedAdViews = deletedAdViews.count;
    console.log(`[Cron] Deleted ${deletedAdViews.count} old ad views`);

    // 11. Delete old ad click tracking data (> 1 year)
    const deletedAdClicks = await prisma.adClick.deleteMany({
      where: {
        createdAt: { lt: oneYearAgo },
      },
    });
    results.deletedAdClicks = deletedAdClicks.count;
    console.log(`[Cron] Deleted ${deletedAdClicks.count} old ad clicks`);

    const totalDeleted = Object.values(results).reduce((sum, count) => sum + count, 0);

    return NextResponse.json({
      success: true,
      message: `Cleanup complete. Deleted ${totalDeleted} total records.`,
      results,
      timestamp: now.toISOString(),
    });
  } catch (error) {
    console.error("Error during cleanup:", error);
    return NextResponse.json(
      { error: "Failed to complete cleanup" },
      { status: 500 }
    );
  }
}

/**
 * GET /api/cron/cleanup
 * Check how much data could be cleaned up (for debugging)
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
    const ninetyDaysAgo = new Date(now);
    ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);
    const oneYearAgo = new Date(now);
    oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);

    // Count data that would be cleaned up
    const [
      oldNotifications,
      expiredSessions,
      expiredVerificationTokens,
      oldSiteViews,
      oldProjectViews,
      oldProjectClicks,
      oldUpdateViews,
      oldListingViews,
      oldListingClicks,
      oldAdViews,
      oldAdClicks,
    ] = await Promise.all([
      prisma.notification.count({
        where: { read: true, createdAt: { lt: ninetyDaysAgo } },
      }),
      prisma.session.count({
        where: { expires: { lt: now } },
      }),
      prisma.verificationToken.count({
        where: { expires: { lt: now } },
      }),
      prisma.siteView.count({
        where: { createdAt: { lt: oneYearAgo } },
      }),
      prisma.projectView.count({
        where: { createdAt: { lt: oneYearAgo } },
      }),
      prisma.projectClick.count({
        where: { createdAt: { lt: oneYearAgo } },
      }),
      prisma.updateView.count({
        where: { createdAt: { lt: oneYearAgo } },
      }),
      prisma.localListingView.count({
        where: { createdAt: { lt: oneYearAgo } },
      }),
      prisma.localListingClick.count({
        where: { createdAt: { lt: oneYearAgo } },
      }),
      prisma.adView.count({
        where: { createdAt: { lt: oneYearAgo } },
      }),
      prisma.adClick.count({
        where: { createdAt: { lt: oneYearAgo } },
      }),
    ]);

    const totalCleanable =
      oldNotifications +
      expiredSessions +
      expiredVerificationTokens +
      oldSiteViews +
      oldProjectViews +
      oldProjectClicks +
      oldUpdateViews +
      oldListingViews +
      oldListingClicks +
      oldAdViews +
      oldAdClicks;

    return NextResponse.json({
      status: "ready",
      stats: {
        totalCleanable,
        oldNotifications: { count: oldNotifications, threshold: "90 days" },
        expiredSessions: { count: expiredSessions, threshold: "expired" },
        expiredVerificationTokens: { count: expiredVerificationTokens, threshold: "expired" },
        oldSiteViews: { count: oldSiteViews, threshold: "1 year" },
        oldProjectViews: { count: oldProjectViews, threshold: "1 year" },
        oldProjectClicks: { count: oldProjectClicks, threshold: "1 year" },
        oldUpdateViews: { count: oldUpdateViews, threshold: "1 year" },
        oldListingViews: { count: oldListingViews, threshold: "1 year" },
        oldListingClicks: { count: oldListingClicks, threshold: "1 year" },
        oldAdViews: { count: oldAdViews, threshold: "1 year" },
        oldAdClicks: { count: oldAdClicks, threshold: "1 year" },
      },
      note: "POST to this endpoint to run cleanup (requires CRON_SECRET)",
    });
  } catch (error) {
    console.error("Error checking cleanup status:", error);
    return NextResponse.json(
      { error: "Failed to check status" },
      { status: 500 }
    );
  }
}
