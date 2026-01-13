import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

interface RouteParams {
  params: Promise<{ slug: string }>;
}

// GET /api/local-listings/[slug]/views - Get view and click stats for a listing
export async function GET(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const { slug } = await params;

    // Find the listing
    const listing = await prisma.localListing.findUnique({
      where: { slug },
      select: { id: true },
    });

    if (!listing) {
      return NextResponse.json(
        { error: "Listing not found" },
        { status: 404 }
      );
    }

    // Get counts in parallel
    const [totalViews, totalClicks, uniqueViewers] = await Promise.all([
      prisma.localListingView.count({
        where: { listingId: listing.id },
      }),
      prisma.localListingClick.count({
        where: { listingId: listing.id },
      }),
      prisma.localListingView.groupBy({
        by: ["visitorId"],
        where: {
          listingId: listing.id,
          visitorId: { not: null },
        },
      }),
    ]);

    // Calculate CTR (Click-Through Rate)
    const ctr = totalViews > 0 ? (totalClicks / totalViews) * 100 : 0;

    return NextResponse.json({
      views: totalViews,
      clicks: totalClicks,
      uniqueViewers: uniqueViewers.length,
      ctr: Math.round(ctr * 10) / 10, // Round to 1 decimal
    });
  } catch (error) {
    console.error("Error fetching listing views:", error);
    return NextResponse.json(
      { error: "Failed to fetch views" },
      { status: 500 }
    );
  }
}

// POST /api/local-listings/[slug]/views - Track a view
export async function POST(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const { slug } = await params;
    const body = await request.json();
    const { visitorId } = body;

    // Find the listing
    const listing = await prisma.localListing.findUnique({
      where: { slug },
      select: { id: true },
    });

    if (!listing) {
      return NextResponse.json(
        { error: "Listing not found" },
        { status: 404 }
      );
    }

    // Debounce: Check if this visitor has viewed this listing in the last hour
    if (visitorId) {
      const oneHourAgo = new Date();
      oneHourAgo.setHours(oneHourAgo.getHours() - 1);

      const recentView = await prisma.localListingView.findFirst({
        where: {
          listingId: listing.id,
          visitorId,
          createdAt: { gt: oneHourAgo },
        },
      });

      if (recentView) {
        return NextResponse.json({ tracked: false, reason: "debounced" });
      }
    }

    // Create the view record
    await prisma.localListingView.create({
      data: {
        listingId: listing.id,
        visitorId: visitorId || null,
      },
    });

    return NextResponse.json({ tracked: true });
  } catch (error) {
    console.error("Error tracking listing view:", error);
    return NextResponse.json(
      { error: "Failed to track view" },
      { status: 500 }
    );
  }
}
