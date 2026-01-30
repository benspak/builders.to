import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { rateLimit, RATE_LIMITS, rateLimitResponse } from "@/lib/rate-limit";

// GET /api/events - List events with filtering
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const skip = (page - 1) * limit;

    // Filter options
    const city = searchParams.get("city");
    const country = searchParams.get("country");
    const isVirtual = searchParams.get("isVirtual");
    const upcoming = searchParams.get("upcoming") !== "false"; // Default to upcoming only
    const organizerId = searchParams.get("organizerId");

    const where: Record<string, unknown> = {
      isPublic: true,
    };

    // Only show upcoming events by default
    if (upcoming) {
      where.startsAt = { gte: new Date() };
    }

    // Location filters
    if (city) {
      where.city = { equals: city, mode: "insensitive" };
    }
    if (country) {
      where.country = { equals: country, mode: "insensitive" };
    }
    if (isVirtual === "true") {
      where.isVirtual = true;
    } else if (isVirtual === "false") {
      where.isVirtual = false;
    }

    // Organizer filter
    if (organizerId) {
      where.organizerId = organizerId;
    }

    const [events, total] = await Promise.all([
      prisma.event.findMany({
        where,
        orderBy: { startsAt: "asc" },
        skip,
        take: limit,
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
              comments: true,
            },
          },
        },
      }),
      prisma.event.count({ where }),
    ]);

    // Get current user's RSVP status for each event
    const session = await auth();
    let userRsvps: Record<string, string> = {};

    if (session?.user?.id) {
      const rsvps = await prisma.eventAttendee.findMany({
        where: {
          userId: session.user.id,
          eventId: { in: events.map((e) => e.id) },
        },
        select: { eventId: true, status: true },
      });
      userRsvps = Object.fromEntries(rsvps.map((r) => [r.eventId, r.status]));
    }

    const eventsWithRsvp = events.map((event) => ({
      ...event,
      attendeeCount: event._count.attendees,
      commentCount: event._count.comments,
      userRsvpStatus: userRsvps[event.id] || null,
    }));

    return NextResponse.json({
      events: eventsWithRsvp,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching events:", error);
    return NextResponse.json(
      { error: "Failed to fetch events" },
      { status: 500 }
    );
  }
}

// POST /api/events - Create a new event
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
      title,
      description,
      startsAt,
      endsAt,
      timezone,
      isVirtual,
      virtualUrl,
      venue,
      address,
      city,
      state,
      country,
      latitude,
      longitude,
      maxAttendees,
      imageUrl,
      isPublic,
    } = body;

    // Validation
    if (!title?.trim()) {
      return NextResponse.json(
        { error: "Title is required" },
        { status: 400 }
      );
    }

    if (!description?.trim()) {
      return NextResponse.json(
        { error: "Description is required" },
        { status: 400 }
      );
    }

    if (!startsAt) {
      return NextResponse.json(
        { error: "Start date/time is required" },
        { status: 400 }
      );
    }

    const startDate = new Date(startsAt);
    if (startDate < new Date()) {
      return NextResponse.json(
        { error: "Event must start in the future" },
        { status: 400 }
      );
    }

    // For in-person events, require location
    if (!isVirtual && !city) {
      return NextResponse.json(
        { error: "City is required for in-person events" },
        { status: 400 }
      );
    }

    // For virtual events, recommend a meeting link
    if (isVirtual && !virtualUrl) {
      // This is just a warning, not an error
      console.log("Virtual event created without meeting link");
    }

    const event = await prisma.event.create({
      data: {
        title: title.trim(),
        description: description.trim(),
        startsAt: startDate,
        endsAt: endsAt ? new Date(endsAt) : null,
        timezone: timezone || "UTC",
        isVirtual: isVirtual || false,
        virtualUrl: virtualUrl || null,
        venue: venue?.trim() || null,
        address: address?.trim() || null,
        city: city?.trim() || null,
        state: state?.trim() || null,
        country: country?.trim() || null,
        latitude: latitude || null,
        longitude: longitude || null,
        maxAttendees: maxAttendees || null,
        imageUrl: imageUrl || null,
        isPublic: isPublic !== false, // Default to public
        organizerId: session.user.id,
      },
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
        isPublic: true,
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
      },
    });

    // Create feed event for public events
    if (event.isPublic) {
      await prisma.feedEvent.create({
        data: {
          type: "EVENT_CREATED",
          title: `New event: ${event.title}`,
          description: event.description.slice(0, 500),
          userId: session.user.id,
          eventId: event.id,
        },
      });
    }

    return NextResponse.json(event, { status: 201 });
  } catch (error) {
    console.error("Error creating event:", error);
    return NextResponse.json(
      { error: "Failed to create event" },
      { status: 500 }
    );
  }
}
