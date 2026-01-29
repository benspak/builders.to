import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import {
  getBoundingBox,
  filterByRadius,
  parseCoordinates,
  parseRadius,
} from "@/lib/geo";

// GET /api/events/nearby - Get events near a location
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
    const limit = Math.min(parseInt(searchParams.get("limit") || "20"), 100);
    const includeVirtual = searchParams.get("includeVirtual") === "true";

    // Get bounding box for initial database query
    const bbox = getBoundingBox(latitude, longitude, radiusKm);

    // Build where clause
    const where: Record<string, unknown> = {
      isPublic: true,
      startsAt: { gte: new Date() },
      latitude: { gte: bbox.minLat, lte: bbox.maxLat },
      longitude: { gte: bbox.minLon, lte: bbox.maxLon },
    };

    // If not including virtual, only get in-person events
    if (!includeVirtual) {
      where.isVirtual = false;
    }

    // Fetch events within bounding box (over-fetch to account for circular radius)
    const events = await prisma.event.findMany({
      where,
      take: limit * 3, // Over-fetch to account for radius filtering
      orderBy: { startsAt: "asc" },
      select: {
        id: true,
        title: true,
        description: true,
        startsAt: true,
        endsAt: true,
        timezone: true,
        isVirtual: true,
        virtualUrl: true,
        venue: true,
        address: true,
        city: true,
        state: true,
        country: true,
        latitude: true,
        longitude: true,
        maxAttendees: true,
        imageUrl: true,
        createdAt: true,
        organizer: {
          select: {
            id: true,
            name: true,
            firstName: true,
            lastName: true,
            image: true,
            slug: true,
          },
        },
        _count: {
          select: {
            attendees: {
              where: { status: "GOING" },
            },
          },
        },
      },
    });

    // Apply precise circular radius filter
    const nearbyEvents = filterByRadius(events, latitude, longitude, radiusKm)
      .slice(0, limit);

    // Get current user's RSVP status
    const session = await auth();
    let userRsvps: Record<string, string> = {};

    if (session?.user?.id) {
      const rsvps = await prisma.eventAttendee.findMany({
        where: {
          userId: session.user.id,
          eventId: { in: nearbyEvents.map((e) => e.id) },
        },
        select: { eventId: true, status: true },
      });
      userRsvps = Object.fromEntries(rsvps.map((r) => [r.eventId, r.status]));
    }

    const eventsWithDistance = nearbyEvents.map((event) => ({
      ...event,
      attendeeCount: event._count.attendees,
      userRsvpStatus: userRsvps[event.id] || null,
      distanceKm: event.distance,
    }));

    return NextResponse.json({
      events: eventsWithDistance,
      center: { latitude, longitude },
      radiusKm,
    });
  } catch (error) {
    console.error("Error fetching nearby events:", error);
    return NextResponse.json(
      { error: "Failed to fetch nearby events" },
      { status: 500 }
    );
  }
}
