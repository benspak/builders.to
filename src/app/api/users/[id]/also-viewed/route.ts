import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

interface RouteParams {
  params: Promise<{ id: string }>;
}

// GET /api/users/[id]/also-viewed - Get "People also viewed" recommendations
// This finds profiles that viewers of this profile also viewed
export async function GET(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const { id } = await params;
    const url = new URL(request.url);
    const limit = Math.min(parseInt(url.searchParams.get("limit") || "5"), 10);

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

    // Get views of this profile from the last 30 days
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    // Find all viewers of this profile (by visitorId or userId)
    const profileViewers = await prisma.profileView.findMany({
      where: {
        viewedUserId: user.id,
        createdAt: { gt: thirtyDaysAgo },
        OR: [
          { viewerVisitorId: { not: null } },
          { viewerUserId: { not: null } },
        ],
      },
      select: {
        viewerVisitorId: true,
        viewerUserId: true,
      },
    });

    if (profileViewers.length === 0) {
      return NextResponse.json({ users: [] });
    }

    // Extract unique viewer identifiers
    const visitorIds = [...new Set(profileViewers.map(v => v.viewerVisitorId).filter(Boolean))] as string[];
    const viewerUserIds = [...new Set(profileViewers.map(v => v.viewerUserId).filter(Boolean))] as string[];

    // Find other profiles these viewers also viewed
    const otherProfileViews = await prisma.profileView.findMany({
      where: {
        viewedUserId: { not: user.id }, // Not the current profile
        createdAt: { gt: thirtyDaysAgo },
        OR: [
          ...(visitorIds.length > 0 ? [{ viewerVisitorId: { in: visitorIds } }] : []),
          ...(viewerUserIds.length > 0 ? [{ viewerUserId: { in: viewerUserIds } }] : []),
        ],
      },
      select: {
        viewedUserId: true,
      },
    });

    // Count how many times each profile was viewed by the same viewers
    const viewCounts: Record<string, number> = {};
    for (const view of otherProfileViews) {
      viewCounts[view.viewedUserId] = (viewCounts[view.viewedUserId] || 0) + 1;
    }

    // Sort by view count and get top profiles
    const topProfileIds = Object.entries(viewCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, limit)
      .map(([userId]) => userId);

    if (topProfileIds.length === 0) {
      return NextResponse.json({ users: [] });
    }

    // Fetch user details for these profiles
    const users = await prisma.user.findMany({
      where: {
        id: { in: topProfileIds },
      },
      select: {
        id: true,
        name: true,
        slug: true,
        displayName: true,
        firstName: true,
        lastName: true,
        image: true,
        headline: true,
        city: true,
        state: true,
        country: true,
        openToWork: true,
        lookingForCofounder: true,
        availableForContract: true,
        openToMeeting: true,
        currentStreak: true,
        _count: {
          select: {
            projects: true,
          },
        },
      },
    });

    // Sort users by the view count order
    const sortedUsers = topProfileIds
      .map(profileId => users.find(u => u.id === profileId))
      .filter(Boolean);

    return NextResponse.json({ users: sortedUsers });
  } catch (error) {
    console.error("Error fetching also viewed:", error);
    return NextResponse.json(
      { error: "Failed to fetch recommendations" },
      { status: 500 }
    );
  }
}
