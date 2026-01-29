import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { rateLimit, RATE_LIMITS, rateLimitResponse } from "@/lib/rate-limit";

interface RouteParams {
  params: Promise<{ id: string }>;
}

// POST /api/events/[id]/rsvp - RSVP to an event
export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    // Rate limit check
    const { success, reset } = rateLimit(request, RATE_LIMITS.action);
    if (!success) {
      return rateLimitResponse(reset);
    }

    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: eventId } = await params;
    const body = await request.json();
    const { status } = body;

    // Validate status
    if (!["GOING", "INTERESTED", "NOT_GOING"].includes(status)) {
      return NextResponse.json(
        { error: "Invalid RSVP status" },
        { status: 400 }
      );
    }

    // Check if event exists and is accessible
    const event = await prisma.event.findUnique({
      where: { id: eventId },
      select: {
        id: true,
        isPublic: true,
        organizerId: true,
        maxAttendees: true,
        startsAt: true,
        _count: {
          select: {
            attendees: {
              where: { status: "GOING" },
            },
          },
        },
      },
    });

    if (!event) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 });
    }

    // Check if event is public or user is organizer
    if (!event.isPublic && event.organizerId !== session.user.id) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 });
    }

    // Check if event hasn't started yet (can't RSVP to past events)
    if (new Date(event.startsAt) < new Date()) {
      return NextResponse.json(
        { error: "Cannot RSVP to past events" },
        { status: 400 }
      );
    }

    // Check capacity if status is GOING
    if (status === "GOING" && event.maxAttendees) {
      const existingRsvp = await prisma.eventAttendee.findUnique({
        where: {
          userId_eventId: {
            userId: session.user.id,
            eventId,
          },
        },
        select: { status: true },
      });

      // Only check capacity if this is a new GOING or changing to GOING
      if (existingRsvp?.status !== "GOING") {
        if (event._count.attendees >= event.maxAttendees) {
          return NextResponse.json(
            { error: "Event is at full capacity" },
            { status: 400 }
          );
        }
      }
    }

    // Upsert the RSVP
    const rsvp = await prisma.eventAttendee.upsert({
      where: {
        userId_eventId: {
          userId: session.user.id,
          eventId,
        },
      },
      create: {
        userId: session.user.id,
        eventId,
        status,
      },
      update: {
        status,
      },
      select: {
        id: true,
        status: true,
        createdAt: true,
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
    });

    // Get updated attendee count
    const attendeeCount = await prisma.eventAttendee.count({
      where: {
        eventId,
        status: "GOING",
      },
    });

    return NextResponse.json({
      rsvp,
      attendeeCount,
    });
  } catch (error) {
    console.error("Error updating RSVP:", error);
    return NextResponse.json(
      { error: "Failed to update RSVP" },
      { status: 500 }
    );
  }
}

// DELETE /api/events/[id]/rsvp - Remove RSVP
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: eventId } = await params;

    // Check if RSVP exists
    const rsvp = await prisma.eventAttendee.findUnique({
      where: {
        userId_eventId: {
          userId: session.user.id,
          eventId,
        },
      },
    });

    if (!rsvp) {
      return NextResponse.json({ error: "RSVP not found" }, { status: 404 });
    }

    await prisma.eventAttendee.delete({
      where: {
        userId_eventId: {
          userId: session.user.id,
          eventId,
        },
      },
    });

    // Get updated attendee count
    const attendeeCount = await prisma.eventAttendee.count({
      where: {
        eventId,
        status: "GOING",
      },
    });

    return NextResponse.json({
      success: true,
      attendeeCount,
    });
  } catch (error) {
    console.error("Error removing RSVP:", error);
    return NextResponse.json(
      { error: "Failed to remove RSVP" },
      { status: 500 }
    );
  }
}

// GET /api/events/[id]/rsvp - Get attendees list
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id: eventId } = await params;
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status") || "GOING";
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "50");
    const skip = (page - 1) * limit;

    // Validate status
    if (!["GOING", "INTERESTED", "NOT_GOING"].includes(status)) {
      return NextResponse.json(
        { error: "Invalid status filter" },
        { status: 400 }
      );
    }

    // Check if event exists
    const event = await prisma.event.findUnique({
      where: { id: eventId },
      select: { id: true, isPublic: true },
    });

    if (!event || !event.isPublic) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 });
    }

    const [attendees, total] = await Promise.all([
      prisma.eventAttendee.findMany({
        where: {
          eventId,
          status: status as "GOING" | "INTERESTED" | "NOT_GOING",
        },
        orderBy: { createdAt: "asc" },
        skip,
        take: limit,
        select: {
          id: true,
          status: true,
          createdAt: true,
          user: {
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
        },
      }),
      prisma.eventAttendee.count({
        where: { eventId, status: status as "GOING" | "INTERESTED" | "NOT_GOING" },
      }),
    ]);

    return NextResponse.json({
      attendees,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching attendees:", error);
    return NextResponse.json(
      { error: "Failed to fetch attendees" },
      { status: 500 }
    );
  }
}
