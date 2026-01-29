import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

interface RouteParams {
  params: Promise<{ id: string }>;
}

// GET /api/events/[id] - Get single event details
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const session = await auth();

    const event = await prisma.event.findUnique({
      where: { id },
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
        updatedAt: true,
        organizerId: true,
        organizer: {
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
        attendees: {
          where: { status: "GOING" },
          take: 20,
          orderBy: { createdAt: "asc" },
          select: {
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
    });

    if (!event) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 });
    }

    // Check access for private events
    if (!event.isPublic) {
      if (!session?.user?.id) {
        return NextResponse.json({ error: "Event not found" }, { status: 404 });
      }

      // Only organizer can see private events
      if (event.organizerId !== session.user.id) {
        return NextResponse.json({ error: "Event not found" }, { status: 404 });
      }
    }

    // Get user's RSVP status if logged in
    let userRsvpStatus = null;
    if (session?.user?.id) {
      const rsvp = await prisma.eventAttendee.findUnique({
        where: {
          userId_eventId: {
            userId: session.user.id,
            eventId: id,
          },
        },
        select: { status: true },
      });
      userRsvpStatus = rsvp?.status || null;
    }

    return NextResponse.json({
      ...event,
      attendeeCount: event._count.attendees,
      commentCount: event._count.comments,
      userRsvpStatus,
      isOrganizer: session?.user?.id === event.organizerId,
    });
  } catch (error) {
    console.error("Error fetching event:", error);
    return NextResponse.json(
      { error: "Failed to fetch event" },
      { status: 500 }
    );
  }
}

// PATCH /api/events/[id] - Update event (organizer only)
export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    // Check if user is the organizer
    const existingEvent = await prisma.event.findUnique({
      where: { id },
      select: { organizerId: true },
    });

    if (!existingEvent) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 });
    }

    if (existingEvent.organizerId !== session.user.id) {
      return NextResponse.json(
        { error: "Only the organizer can edit this event" },
        { status: 403 }
      );
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

    const updateData: Record<string, unknown> = {};

    if (title !== undefined) updateData.title = title.trim();
    if (description !== undefined) updateData.description = description.trim();
    if (startsAt !== undefined) updateData.startsAt = new Date(startsAt);
    if (endsAt !== undefined) updateData.endsAt = endsAt ? new Date(endsAt) : null;
    if (timezone !== undefined) updateData.timezone = timezone;
    if (isVirtual !== undefined) updateData.isVirtual = isVirtual;
    if (virtualUrl !== undefined) updateData.virtualUrl = virtualUrl || null;
    if (venue !== undefined) updateData.venue = venue?.trim() || null;
    if (address !== undefined) updateData.address = address?.trim() || null;
    if (city !== undefined) updateData.city = city?.trim() || null;
    if (state !== undefined) updateData.state = state?.trim() || null;
    if (country !== undefined) updateData.country = country?.trim() || null;
    if (latitude !== undefined) updateData.latitude = latitude || null;
    if (longitude !== undefined) updateData.longitude = longitude || null;
    if (maxAttendees !== undefined) updateData.maxAttendees = maxAttendees || null;
    if (imageUrl !== undefined) updateData.imageUrl = imageUrl || null;
    if (isPublic !== undefined) updateData.isPublic = isPublic;

    const event = await prisma.event.update({
      where: { id },
      data: updateData,
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
        updatedAt: true,
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

    return NextResponse.json(event);
  } catch (error) {
    console.error("Error updating event:", error);
    return NextResponse.json(
      { error: "Failed to update event" },
      { status: 500 }
    );
  }
}

// DELETE /api/events/[id] - Delete event (organizer only)
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    // Check if user is the organizer
    const event = await prisma.event.findUnique({
      where: { id },
      select: { organizerId: true },
    });

    if (!event) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 });
    }

    if (event.organizerId !== session.user.id) {
      return NextResponse.json(
        { error: "Only the organizer can delete this event" },
        { status: 403 }
      );
    }

    await prisma.event.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting event:", error);
    return NextResponse.json(
      { error: "Failed to delete event" },
      { status: 500 }
    );
  }
}
