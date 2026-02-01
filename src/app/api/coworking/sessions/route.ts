import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { rateLimit, RATE_LIMITS, rateLimitResponse } from "@/lib/rate-limit";
import {
  getBoundingBox,
  filterByRadius,
  parseCoordinates,
  parseRadius,
} from "@/lib/geo";

// GET /api/coworking/sessions - List coworking sessions
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const skip = (page - 1) * limit;

    // Filter options
    const city = searchParams.get("city");
    const country = searchParams.get("country");
    const dateStr = searchParams.get("date");
    const venueType = searchParams.get("venueType");
    const hostId = searchParams.get("hostId");

    // Nearby filtering
    const coords = parseCoordinates(
      searchParams.get("latitude"),
      searchParams.get("longitude")
    );
    const radiusKm = parseRadius(searchParams.get("radius"), 25, 100);

    const where: Record<string, unknown> = {};

    // Default to future sessions
    if (dateStr) {
      where.date = new Date(dateStr);
    } else {
      where.date = { gte: new Date(new Date().toDateString()) };
    }

    // Location filters
    if (city) {
      where.city = { equals: city, mode: "insensitive" };
    }
    if (country) {
      where.country = { equals: country, mode: "insensitive" };
    }
    if (venueType) {
      where.venueType = venueType;
    }
    if (hostId) {
      where.hostId = hostId;
    }

    // Add bounding box filter for nearby queries
    if (coords) {
      const bbox = getBoundingBox(coords.latitude, coords.longitude, radiusKm);
      where.latitude = { gte: bbox.minLat, lte: bbox.maxLat };
      where.longitude = { gte: bbox.minLon, lte: bbox.maxLon };
    }

    const [sessions, total] = await Promise.all([
      prisma.coworkingSession.findMany({
        where,
        orderBy: [{ date: "asc" }, { startTime: "asc" }],
        skip,
        take: limit,
        select: {
          id: true,
          date: true,
          startTime: true,
          endTime: true,
          venueName: true,
          venueType: true,
          address: true,
          city: true,
          state: true,
          country: true,
          latitude: true,
          longitude: true,
          maxBuddies: true,
          description: true,
          createdAt: true,
          host: {
            select: {
              id: true,
              name: true,
              firstName: true,
              lastName: true,
              image: true,
              slug: true,
              headline: true,
            },
          },
          buddies: {
            where: { status: "ACCEPTED" },
            select: {
              status: true,
              user: {
                select: {
                  id: true,
                  name: true,
                  firstName: true,
                  lastName: true,
                  image: true,
                  slug: true,
                },
              },
            },
          },
          _count: {
            select: {
              buddies: {
                where: { status: "ACCEPTED" },
              },
            },
          },
        },
      }),
      prisma.coworkingSession.count({ where }),
    ]);

    // Apply precise radius filter if nearby query
    let filteredSessions = sessions;
    if (coords) {
      const sessionsWithDistance = filterByRadius(
        sessions,
        coords.latitude,
        coords.longitude,
        radiusKm
      );
      filteredSessions = sessionsWithDistance;
    }

    // Get current user's buddy status
    const session = await auth();
    let userBuddyStatus: Record<string, string> = {};

    if (session?.user?.id) {
      const buddies = await prisma.coworkingBuddy.findMany({
        where: {
          userId: session.user.id,
          sessionId: { in: filteredSessions.map((s) => s.id) },
        },
        select: { sessionId: true, status: true },
      });
      userBuddyStatus = Object.fromEntries(
        buddies.map((b) => [b.sessionId, b.status])
      );
    }

    const sessionsWithMeta = filteredSessions.map((s) => ({
      ...s,
      acceptedCount: s._count.buddies,
      spotsRemaining: s.maxBuddies - s._count.buddies,
      userBuddyStatus: userBuddyStatus[s.id] || null,
      isHost: session?.user?.id === s.host.id,
    }));

    return NextResponse.json({
      sessions: sessionsWithMeta,
      pagination: {
        page,
        limit,
        total: coords ? filteredSessions.length : total,
        totalPages: Math.ceil((coords ? filteredSessions.length : total) / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching coworking sessions:", error);
    return NextResponse.json(
      { error: "Failed to fetch sessions" },
      { status: 500 }
    );
  }
}

// POST /api/coworking/sessions - Create a new coworking session
export async function POST(request: NextRequest) {
  try {
    // Rate limit check
    const { success, reset } = rateLimit(request, RATE_LIMITS.create);
    if (!success) {
      return rateLimitResponse(reset);
    }

    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const {
      date,
      startTime,
      endTime,
      venueName,
      venueType,
      address,
      city,
      state,
      country,
      latitude,
      longitude,
      maxBuddies,
      description,
    } = body;

    // Validation
    if (!date) {
      return NextResponse.json(
        { error: "Date is required" },
        { status: 400 }
      );
    }

    const sessionDate = new Date(date);
    if (sessionDate < new Date(new Date().toDateString())) {
      return NextResponse.json(
        { error: "Session must be scheduled for today or a future date" },
        { status: 400 }
      );
    }

    if (!startTime) {
      return NextResponse.json(
        { error: "Start time is required" },
        { status: 400 }
      );
    }

    if (!venueName?.trim()) {
      return NextResponse.json(
        { error: "Venue name is required" },
        { status: 400 }
      );
    }

    if (!venueType || !["CAFE", "COWORKING_SPACE", "LIBRARY", "OTHER"].includes(venueType)) {
      return NextResponse.json(
        { error: "Valid venue type is required" },
        { status: 400 }
      );
    }

    if (!city?.trim()) {
      return NextResponse.json(
        { error: "City is required" },
        { status: 400 }
      );
    }

    if (!country?.trim()) {
      return NextResponse.json(
        { error: "Country is required" },
        { status: 400 }
      );
    }

    const coworkingSession = await prisma.coworkingSession.create({
      data: {
        date: sessionDate,
        startTime,
        endTime: endTime || null,
        venueName: venueName.trim(),
        venueType,
        address: address?.trim() || null,
        city: city.trim(),
        state: state?.trim() || null,
        country: country.trim(),
        latitude: latitude || null,
        longitude: longitude || null,
        maxBuddies: maxBuddies || 1,
        description: description?.trim() || null,
        hostId: session.user.id,
      },
      select: {
        id: true,
        date: true,
        startTime: true,
        endTime: true,
        venueName: true,
        venueType: true,
        address: true,
        city: true,
        state: true,
        country: true,
        latitude: true,
        longitude: true,
        maxBuddies: true,
        description: true,
        createdAt: true,
        host: {
          select: {
            id: true,
            name: true,
            firstName: true,
            lastName: true,
            image: true,
            slug: true,
          },
        },
      },
    });

    // Create a feed event for the new coworking session
    // NOTE: Temporarily disabled until migration is applied to production database
    // The coworkingSessionId column and COWORKING_SESSION_CREATED enum value don't exist yet
    /*
    try {
      const sessionDateFormatted = sessionDate.toLocaleDateString("en-US", {
        weekday: "short",
        month: "short",
        day: "numeric",
      });

      await prisma.feedEvent.create({
        data: {
          type: "COWORKING_SESSION_CREATED",
          userId: session.user.id,
          coworkingSessionId: coworkingSession.id,
          title: `Coworking at ${venueName.trim()}`,
          description: `${sessionDateFormatted} at ${startTime}${endTime ? ` - ${endTime}` : ""} · ${city.trim()}${state ? `, ${state.trim()}` : ""}, ${country.trim()}${description?.trim() ? ` · ${description.trim()}` : ""}`,
        },
      });
    } catch (feedError) {
      console.warn("Could not create feed event for coworking session:", feedError);
    }
    */

    return NextResponse.json(coworkingSession, { status: 201 });
  } catch (error) {
    console.error("Error creating coworking session:", error);
    return NextResponse.json(
      { error: "Failed to create session" },
      { status: 500 }
    );
  }
}
