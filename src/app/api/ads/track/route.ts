import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// POST /api/ads/track - Track an ad view
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { adId, visitorId } = body;

    if (!adId || typeof adId !== "string") {
      return NextResponse.json(
        { error: "Ad ID is required" },
        { status: 400 }
      );
    }

    // Verify the ad exists and is active
    const ad = await prisma.advertisement.findUnique({
      where: { id: adId },
      select: { id: true, status: true },
    });

    if (!ad || ad.status !== "ACTIVE") {
      return NextResponse.json(
        { error: "Ad not found or not active" },
        { status: 404 }
      );
    }

    // Debounce: Check if this visitor has viewed this ad in the last hour
    if (visitorId) {
      const oneHourAgo = new Date();
      oneHourAgo.setHours(oneHourAgo.getHours() - 1);

      const recentView = await prisma.adView.findFirst({
        where: {
          adId,
          visitorId,
          createdAt: { gt: oneHourAgo },
        },
      });

      if (recentView) {
        // Already viewed recently, skip tracking
        return NextResponse.json({ tracked: false, reason: "debounced" });
      }
    }

    // Create the view record
    await prisma.adView.create({
      data: {
        adId,
        visitorId: visitorId || null,
      },
    });

    return NextResponse.json({ tracked: true });
  } catch (error) {
    console.error("Error tracking ad view:", error);
    return NextResponse.json(
      { error: "Failed to track ad view" },
      { status: 500 }
    );
  }
}
