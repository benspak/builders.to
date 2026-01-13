import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

interface RouteParams {
  params: Promise<{ id: string }>;
}

// GET /api/updates/[id]/views - Get view stats for an update
export async function GET(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const { id } = await params;

    // Verify the update exists
    const update = await prisma.dailyUpdate.findUnique({
      where: { id },
      select: { id: true },
    });

    if (!update) {
      return NextResponse.json(
        { error: "Update not found" },
        { status: 404 }
      );
    }

    // Get counts in parallel
    const [totalViews, uniqueViewers] = await Promise.all([
      prisma.updateView.count({
        where: { updateId: id },
      }),
      prisma.updateView.groupBy({
        by: ["visitorId"],
        where: {
          updateId: id,
          visitorId: { not: null },
        },
      }),
    ]);

    return NextResponse.json({
      views: totalViews,
      uniqueViewers: uniqueViewers.length,
    });
  } catch (error) {
    console.error("Error fetching update views:", error);
    return NextResponse.json(
      { error: "Failed to fetch views" },
      { status: 500 }
    );
  }
}

// POST /api/updates/[id]/views - Track a view
export async function POST(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { visitorId } = body;

    // Verify the update exists
    const update = await prisma.dailyUpdate.findUnique({
      where: { id },
      select: { id: true },
    });

    if (!update) {
      return NextResponse.json(
        { error: "Update not found" },
        { status: 404 }
      );
    }

    // Debounce: Check if this visitor has viewed this update in the last hour
    if (visitorId) {
      const oneHourAgo = new Date();
      oneHourAgo.setHours(oneHourAgo.getHours() - 1);

      const recentView = await prisma.updateView.findFirst({
        where: {
          updateId: id,
          visitorId,
          createdAt: { gt: oneHourAgo },
        },
      });

      if (recentView) {
        return NextResponse.json({ tracked: false, reason: "debounced" });
      }
    }

    // Create the view record
    await prisma.updateView.create({
      data: {
        updateId: id,
        visitorId: visitorId || null,
      },
    });

    return NextResponse.json({ tracked: true });
  } catch (error) {
    console.error("Error tracking update view:", error);
    return NextResponse.json(
      { error: "Failed to track view" },
      { status: 500 }
    );
  }
}
