import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Disable Next.js caching for this route
export const dynamic = "force-dynamic";

// GET /api/ads/active - Get all active ads for display on the feed
export async function GET() {
  try {
    const now = new Date();

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

    // Return with no-cache headers to ensure fresh ads on each page view
    return NextResponse.json(activeAds, {
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
