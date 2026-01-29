import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { rateLimit, RATE_LIMITS, rateLimitResponse } from "@/lib/rate-limit";

interface RouteParams {
  params: Promise<{ id: string }>;
}

// POST /api/coworking/sessions/[id]/join - Request to join a session
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

    const { id: sessionId } = await params;
    const body = await request.json();
    const { message } = body;

    // Check if session exists
    const coworkingSession = await prisma.coworkingSession.findUnique({
      where: { id: sessionId },
      select: {
        id: true,
        hostId: true,
        maxBuddies: true,
        date: true,
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

    // Can't join your own session
    if (coworkingSession.hostId === session.user.id) {
      return NextResponse.json(
        { error: "You cannot join your own session" },
        { status: 400 }
      );
    }

    // Check if session is in the past
    if (new Date(coworkingSession.date) < new Date(new Date().toDateString())) {
      return NextResponse.json(
        { error: "Cannot join past sessions" },
        { status: 400 }
      );
    }

    // Check if already requested
    const existingBuddy = await prisma.coworkingBuddy.findUnique({
      where: {
        userId_sessionId: {
          userId: session.user.id,
          sessionId,
        },
      },
    });

    if (existingBuddy) {
      return NextResponse.json(
        { error: "You have already requested to join this session" },
        { status: 400 }
      );
    }

    // Check capacity
    if (coworkingSession._count.buddies >= coworkingSession.maxBuddies) {
      return NextResponse.json(
        { error: "This session is at full capacity" },
        { status: 400 }
      );
    }

    // Create buddy request
    const buddy = await prisma.coworkingBuddy.create({
      data: {
        userId: session.user.id,
        sessionId,
        message: message?.trim() || null,
        status: "PENDING",
      },
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
          },
        },
      },
    });

    // TODO: Send notification to host

    return NextResponse.json(buddy, { status: 201 });
  } catch (error) {
    console.error("Error joining coworking session:", error);
    return NextResponse.json(
      { error: "Failed to join session" },
      { status: 500 }
    );
  }
}

// DELETE /api/coworking/sessions/[id]/join - Cancel join request or leave session
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: sessionId } = await params;

    // Check if buddy request exists
    const buddy = await prisma.coworkingBuddy.findUnique({
      where: {
        userId_sessionId: {
          userId: session.user.id,
          sessionId,
        },
      },
    });

    if (!buddy) {
      return NextResponse.json(
        { error: "Join request not found" },
        { status: 404 }
      );
    }

    await prisma.coworkingBuddy.delete({
      where: {
        userId_sessionId: {
          userId: session.user.id,
          sessionId,
        },
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error leaving coworking session:", error);
    return NextResponse.json(
      { error: "Failed to leave session" },
      { status: 500 }
    );
  }
}
