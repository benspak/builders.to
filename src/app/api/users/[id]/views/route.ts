import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

interface RouteParams {
  params: Promise<{ id: string }>;
}

// GET /api/users/[id]/views - Get view stats for a user profile
export async function GET(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const { id } = await params;

    // Find the user
    const user = await prisma.user.findUnique({
      where: { id },
      select: { id: true },
    });

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    // Get counts in parallel
    const [totalViews, uniqueViewers] = await Promise.all([
      prisma.profileView.count({
        where: { viewedUserId: user.id },
      }),
      prisma.profileView.groupBy({
        by: ["viewerVisitorId"],
        where: {
          viewedUserId: user.id,
          viewerVisitorId: { not: null },
        },
      }),
    ]);

    return NextResponse.json({
      views: totalViews,
      uniqueViewers: uniqueViewers.length,
    });
  } catch (error) {
    console.error("Error fetching profile views:", error);
    return NextResponse.json(
      { error: "Failed to fetch views" },
      { status: 500 }
    );
  }
}

// POST /api/users/[id]/views - Track a profile view
export async function POST(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const { id } = await params;
    const session = await auth();
    const body = await request.json();
    const { visitorId, referrerUserId } = body;

    // Find the user being viewed
    const user = await prisma.user.findUnique({
      where: { id },
      select: { id: true },
    });

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    // Don't track views of your own profile
    if (session?.user?.id === user.id) {
      return NextResponse.json({ tracked: false, reason: "own_profile" });
    }

    // Validate referrer if provided
    let validReferrerId: string | null = null;
    if (referrerUserId) {
      const referrer = await prisma.user.findUnique({
        where: { id: referrerUserId },
        select: { id: true },
      });
      if (referrer && referrer.id !== user.id) {
        validReferrerId = referrer.id;
      }
    }

    // Debounce: Check if this visitor has viewed this profile in the last hour
    const oneHourAgo = new Date();
    oneHourAgo.setHours(oneHourAgo.getHours() - 1);

    const recentViewWhere = {
      viewedUserId: user.id,
      createdAt: { gt: oneHourAgo },
      ...(session?.user?.id
        ? { viewerUserId: session.user.id }
        : visitorId
        ? { viewerVisitorId: visitorId }
        : {}),
    };

    // Only check for debounce if we have some identifier
    if (session?.user?.id || visitorId) {
      const recentView = await prisma.profileView.findFirst({
        where: recentViewWhere,
      });

      if (recentView) {
        return NextResponse.json({ tracked: false, reason: "debounced" });
      }
    }

    // Create the view record
    await prisma.profileView.create({
      data: {
        viewedUserId: user.id,
        viewerUserId: session?.user?.id || null,
        viewerVisitorId: visitorId || null,
        referrerUserId: validReferrerId,
      },
    });

    return NextResponse.json({ tracked: true });
  } catch (error) {
    console.error("Error tracking profile view:", error);
    return NextResponse.json(
      { error: "Failed to track view" },
      { status: 500 }
    );
  }
}
