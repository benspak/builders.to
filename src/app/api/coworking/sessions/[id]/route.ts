import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

interface RouteParams {
  params: Promise<{ id: string }>;
}

// GET /api/coworking/sessions/[id] - Get session details
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const session = await auth();

    const coworkingSession = await prisma.coworkingSession.findUnique({
      where: { id },
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
        updatedAt: true,
        hostId: true,
        host: {
          select: {
            id: true,
            name: true,
            firstName: true,
            lastName: true,
            image: true,
            slug: true,
            headline: true,
            bio: true,
          },
        },
        buddies: {
          orderBy: { createdAt: "asc" },
          select: {
            id: true,
            status: true,
            message: true,
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
        },
        _count: {
          select: {
            buddies: {
              where: { status: "ACCEPTED" },
            },
          },
        },
      },
    });

    if (!coworkingSession) {
      return NextResponse.json(
        { error: "Session not found" },
        { status: 404 }
      );
    }

    // Get user's buddy status if logged in
    let userBuddyStatus = null;
    let userBuddyRequest = null;
    if (session?.user?.id) {
      const buddy = coworkingSession.buddies.find(
        (b) => b.user.id === session.user!.id
      );
      if (buddy) {
        userBuddyStatus = buddy.status;
        userBuddyRequest = buddy;
      }
    }

    // Only show all buddies to host, others only see accepted
    const visibleBuddies =
      session?.user?.id === coworkingSession.hostId
        ? coworkingSession.buddies
        : coworkingSession.buddies.filter((b) => b.status === "ACCEPTED");

    return NextResponse.json({
      ...coworkingSession,
      buddies: visibleBuddies,
      acceptedCount: coworkingSession._count.buddies,
      spotsRemaining: coworkingSession.maxBuddies - coworkingSession._count.buddies,
      userBuddyStatus,
      userBuddyRequest,
      isHost: session?.user?.id === coworkingSession.hostId,
    });
  } catch (error) {
    console.error("Error fetching coworking session:", error);
    return NextResponse.json(
      { error: "Failed to fetch session" },
      { status: 500 }
    );
  }
}

// PATCH /api/coworking/sessions/[id] - Update session (host only)
export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    // Check if user is the host
    const existingSession = await prisma.coworkingSession.findUnique({
      where: { id },
      select: { hostId: true },
    });

    if (!existingSession) {
      return NextResponse.json(
        { error: "Session not found" },
        { status: 404 }
      );
    }

    if (existingSession.hostId !== session.user.id) {
      return NextResponse.json(
        { error: "Only the host can edit this session" },
        { status: 403 }
      );
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

    const updateData: Record<string, unknown> = {};

    if (date !== undefined) updateData.date = new Date(date);
    if (startTime !== undefined) updateData.startTime = startTime;
    if (endTime !== undefined) updateData.endTime = endTime || null;
    if (venueName !== undefined) updateData.venueName = venueName.trim();
    if (venueType !== undefined) updateData.venueType = venueType;
    if (address !== undefined) updateData.address = address?.trim() || null;
    if (city !== undefined) updateData.city = city.trim();
    if (state !== undefined) updateData.state = state?.trim() || null;
    if (country !== undefined) updateData.country = country.trim();
    if (latitude !== undefined) updateData.latitude = latitude || null;
    if (longitude !== undefined) updateData.longitude = longitude || null;
    if (maxBuddies !== undefined) updateData.maxBuddies = maxBuddies;
    if (description !== undefined) updateData.description = description?.trim() || null;

    const coworkingSession = await prisma.coworkingSession.update({
      where: { id },
      data: updateData,
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
        updatedAt: true,
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

    return NextResponse.json(coworkingSession);
  } catch (error) {
    console.error("Error updating coworking session:", error);
    return NextResponse.json(
      { error: "Failed to update session" },
      { status: 500 }
    );
  }
}

// DELETE /api/coworking/sessions/[id] - Delete session (host only)
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    // Check if user is the host
    const existingSession = await prisma.coworkingSession.findUnique({
      where: { id },
      select: { hostId: true },
    });

    if (!existingSession) {
      return NextResponse.json(
        { error: "Session not found" },
        { status: 404 }
      );
    }

    if (existingSession.hostId !== session.user.id) {
      return NextResponse.json(
        { error: "Only the host can delete this session" },
        { status: 403 }
      );
    }

    await prisma.coworkingSession.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting coworking session:", error);
    return NextResponse.json(
      { error: "Failed to delete session" },
      { status: 500 }
    );
  }
}
