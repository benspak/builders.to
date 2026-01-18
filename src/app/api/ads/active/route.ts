import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Disable Next.js caching for this route
export const dynamic = "force-dynamic";

// GET /api/ads/active - Get all active ads for display on the feed
// Accepts optional visitorId query param to include view counts for smart rotation
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const visitorId = searchParams.get("visitorId");

    const now = new Date();
    const twentyFourHoursAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);

    const activeAds = await prisma.advertisement.findMany({
      where: {
        status: "ACTIVE",
        startDate: { lte: now },
        endDate: { gt: now },
      },
      select: {
        id: true,
        title: true,
        description: true,
        imageUrl: true,
        linkUrl: true,
        ctaText: true,
      },
      orderBy: { createdAt: "asc" }, // FIFO for fairness
    });

    // If visitorId provided, get view counts for each ad for this visitor
    let adsWithViewCounts = activeAds.map((ad) => ({ ...ad, viewCount: 0 }));

    if (visitorId && activeAds.length > 0) {
      // Get view counts for this visitor in the last 24 hours
      const viewCounts = await prisma.adView.groupBy({
        by: ["adId"],
        where: {
          visitorId,
          adId: { in: activeAds.map((ad) => ad.id) },
          createdAt: { gte: twentyFourHoursAgo },
        },
        _count: { id: true },
      });

      // Create a map for quick lookup
      const viewCountMap = new Map(
        viewCounts.map((vc) => [vc.adId, vc._count.id])
      );

      // Attach view counts to ads
      adsWithViewCounts = activeAds.map((ad) => ({
        ...ad,
        viewCount: viewCountMap.get(ad.id) || 0,
      }));
    }

    // Return with no-cache headers to ensure fresh ads on each page view
    return NextResponse.json(adsWithViewCounts, {
      headers: {
        "Cache-Control": "no-store, no-cache, must-revalidate",
        "Pragma": "no-cache",
        "Expires": "0",
      },
    });
  } catch (error) {
    console.error("Error fetching active ads:", error);
    return NextResponse.json(
      { error: "Failed to fetch active ads" },
      { status: 500 }
    );
  }
}
