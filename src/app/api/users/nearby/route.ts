import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import {
  getBoundingBox,
  filterByRadius,
  parseCoordinates,
  parseRadius,
} from "@/lib/geo";

// GET /api/users/nearby - Find users near a location
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    // Parse coordinates
    const coords = parseCoordinates(
      searchParams.get("latitude"),
      searchParams.get("longitude")
    );

    if (!coords) {
      return NextResponse.json(
        { error: "Valid latitude and longitude are required" },
        { status: 400 }
      );
    }

    const { latitude, longitude } = coords;
    const radiusKm = parseRadius(searchParams.get("radius"), 50, 500);
    const limit = Math.min(parseInt(searchParams.get("limit") || "50"), 100);

    // Optional filters
    const openToWork = searchParams.get("openToWork") === "true";
    const lookingForCofounder = searchParams.get("lookingForCofounder") === "true";
    const availableForContract = searchParams.get("availableForContract") === "true";
    const openToMeeting = searchParams.get("openToMeeting") === "true";

    // Get bounding box for initial database query
    const bbox = getBoundingBox(latitude, longitude, radiusKm);

    // Build where clause
    const where: Record<string, unknown> = {
      latitude: { gte: bbox.minLat, lte: bbox.maxLat },
      longitude: { gte: bbox.minLon, lte: bbox.maxLon },
    };

    // Add optional filters
    if (openToWork) where.openToWork = true;
    if (lookingForCofounder) where.lookingForCofounder = true;
    if (availableForContract) where.availableForContract = true;
    if (openToMeeting) where.openToMeeting = true;

    // Fetch users within bounding box
    const users = await prisma.user.findMany({
      where,
      take: limit * 2, // Over-fetch to account for radius filtering
      select: {
        id: true,
        name: true,
        firstName: true,
        lastName: true,
        displayName: true,
        image: true,
        slug: true,
        headline: true,
        city: true,
        state: true,
        country: true,
        latitude: true,
        longitude: true,
        openToWork: true,
        lookingForCofounder: true,
        availableForContract: true,
        openToMeeting: true,
        currentStreak: true,
        _count: {
          select: {
            projects: true,
            followers: true,
          },
        },
      },
    });

    // Apply precise circular radius filter
    const nearbyUsers = filterByRadius(users, latitude, longitude, radiusKm)
      .slice(0, limit);

    // Get current user for follow status
    const session = await auth();
    let followingIds: Set<string> = new Set();

    if (session?.user?.id) {
      const following = await prisma.follow.findMany({
        where: {
          followerId: session.user.id,
          followingId: { in: nearbyUsers.map((u) => u.id) },
        },
        select: { followingId: true },
      });
      followingIds = new Set(following.map((f) => f.followingId));
    }

    const usersWithMeta = nearbyUsers
      .filter((u) => u.id !== session?.user?.id) // Exclude current user
      .map((user) => ({
        ...user,
        projectCount: user._count.projects,
        followerCount: user._count.followers,
        distanceKm: user.distance,
        isFollowing: followingIds.has(user.id),
      }));

    return NextResponse.json({
      users: usersWithMeta,
      center: { latitude, longitude },
      radiusKm,
      total: usersWithMeta.length,
    });
  } catch (error) {
    console.error("Error fetching nearby users:", error);
    return NextResponse.json(
      { error: "Failed to fetch nearby users" },
      { status: 500 }
    );
  }
}
