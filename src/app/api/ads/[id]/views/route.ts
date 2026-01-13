import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

interface RouteParams {
  params: Promise<{ id: string }>;
}

// GET /api/ads/[id]/views - Get view and click analytics for an ad
export async function GET(request: Request, { params }: RouteParams) {
  try {
    const session = await auth();
    const { id } = await params;

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "You must be signed in to view analytics" },
        { status: 401 }
      );
    }

    // Verify the ad exists and belongs to the user
    const ad = await prisma.advertisement.findUnique({
      where: { id },
      select: { id: true, userId: true, startDate: true, endDate: true },
    });

    if (!ad) {
      return NextResponse.json(
        { error: "Ad not found" },
        { status: 404 }
      );
    }

    if (ad.userId !== session.user.id) {
      return NextResponse.json(
        { error: "You can only view analytics for your own ads" },
        { status: 403 }
      );
    }

    // Get total views
    const totalViews = await prisma.adView.count({
      where: { adId: id },
    });

    // Get total clicks
    const totalClicks = await prisma.adClick.count({
      where: { adId: id },
    });

    // Get unique visitors (by visitorId)
    const uniqueVisitors = await prisma.adView.groupBy({
      by: ["visitorId"],
      where: {
        adId: id,
        visitorId: { not: null },
      },
    });

    // Get all views for the last 30 days
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const views = await prisma.adView.findMany({
      where: {
        adId: id,
        createdAt: { gte: thirtyDaysAgo },
      },
      select: { createdAt: true },
      orderBy: { createdAt: "asc" },
    });

    // Get all clicks for the last 30 days
    const clicks = await prisma.adClick.findMany({
      where: {
        adId: id,
        createdAt: { gte: thirtyDaysAgo },
      },
      select: { createdAt: true },
      orderBy: { createdAt: "asc" },
    });

    // Aggregate views by date (day)
    const dailyViews: Record<string, number> = {};
    views.forEach((view) => {
      const date = view.createdAt.toISOString().split("T")[0];
      dailyViews[date] = (dailyViews[date] || 0) + 1;
    });

    // Aggregate clicks by date (day)
    const dailyClicks: Record<string, number> = {};
    clicks.forEach((click) => {
      const date = click.createdAt.toISOString().split("T")[0];
      dailyClicks[date] = (dailyClicks[date] || 0) + 1;
    });

    // Get all unique dates and fill in zeros for missing days
    const allDates = new Set([...Object.keys(dailyViews), ...Object.keys(dailyClicks)]);

    // Fill in missing dates between start and end to have continuous data
    if (ad.startDate) {
      const startDate = new Date(ad.startDate);
      const endDate = ad.endDate ? new Date(ad.endDate) : new Date();
      const today = new Date();
      const actualEndDate = endDate < today ? endDate : today;

      for (let d = new Date(startDate); d <= actualEndDate; d.setDate(d.getDate() + 1)) {
        const dateStr = d.toISOString().split("T")[0];
        allDates.add(dateStr);
      }
    }

    // Convert to sorted array format for charting
    const sortedDates = Array.from(allDates).sort();
    const dailyViewsArray = sortedDates.map((date) => ({
      date,
      views: dailyViews[date] || 0,
      clicks: dailyClicks[date] || 0,
    }));

    // Get views and clicks for today
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayViews = await prisma.adView.count({
      where: {
        adId: id,
        createdAt: { gte: today },
      },
    });
    const todayClicks = await prisma.adClick.count({
      where: {
        adId: id,
        createdAt: { gte: today },
      },
    });

    // Calculate CTR (Click-Through Rate)
    const ctr = totalViews > 0 ? (totalClicks / totalViews) * 100 : 0;

    return NextResponse.json({
      totalViews,
      totalClicks,
      ctr: Math.round(ctr * 100) / 100, // Round to 2 decimal places
      uniqueVisitors: uniqueVisitors.length,
      todayViews,
      todayClicks,
      dailyViews: dailyViewsArray,
      adPeriod: {
        startDate: ad.startDate,
        endDate: ad.endDate,
      },
    });
  } catch (error) {
    console.error("Error fetching ad analytics:", error);
    return NextResponse.json(
      { error: "Failed to fetch analytics" },
      { status: 500 }
    );
  }
}
