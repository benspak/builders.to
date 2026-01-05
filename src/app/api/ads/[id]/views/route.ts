import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

interface RouteParams {
  params: Promise<{ id: string }>;
}

// GET /api/ads/[id]/views - Get view analytics for an ad
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

    // Get unique visitors (by visitorId)
    const uniqueVisitors = await prisma.adView.groupBy({
      by: ["visitorId"],
      where: {
        adId: id,
        visitorId: { not: null },
      },
    });

    // Get views per day for the last 30 days
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const viewsByDay = await prisma.adView.groupBy({
      by: ["createdAt"],
      where: {
        adId: id,
        createdAt: { gte: thirtyDaysAgo },
      },
      _count: true,
      orderBy: { createdAt: "asc" },
    });

    // Aggregate views by date (day)
    const dailyViews: Record<string, number> = {};
    viewsByDay.forEach((view) => {
      const date = view.createdAt.toISOString().split("T")[0];
      dailyViews[date] = (dailyViews[date] || 0) + view._count;
    });

    // Convert to array format for charting
    const dailyViewsArray = Object.entries(dailyViews).map(([date, count]) => ({
      date,
      views: count,
    }));

    // Get views for today
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayViews = await prisma.adView.count({
      where: {
        adId: id,
        createdAt: { gte: today },
      },
    });

    return NextResponse.json({
      totalViews,
      uniqueVisitors: uniqueVisitors.length,
      todayViews,
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
