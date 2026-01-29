import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { rateLimit, RATE_LIMITS, rateLimitResponse } from "@/lib/rate-limit";

interface RouteParams {
  params: Promise<{ id: string }>;
}

// POST /api/coworking/sessions/[id]/respond - Accept or decline a buddy request (host only)
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
    const { buddyId, action } = body;

    if (!buddyId) {
      return NextResponse.json(
        { error: "Buddy ID is required" },
        { status: 400 }
      );
    }

    if (!["accept", "decline"].includes(action)) {
      return NextResponse.json(
        { error: "Action must be 'accept' or 'decline'" },
        { status: 400 }
      );
    }

    // Check if user is the host
    const coworkingSession = await prisma.coworkingSession.findUnique({
      where: { id: sessionId },
      select: {
        id: true,
        hostId: true,
        maxBuddies: true,
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

    if (coworkingSession.hostId !== session.user.id) {
      return NextResponse.json(
        { error: "Only the host can respond to join requests" },
        { status: 403 }
      );
    }

    // Check if buddy request exists and is pending
    const buddy = await prisma.coworkingBuddy.findUnique({
      where: { id: buddyId },
      select: {
        id: true,
        status: true,
        sessionId: true,
        userId: true,
      },
    });

    if (!buddy || buddy.sessionId !== sessionId) {
      return NextResponse.json(
        { error: "Buddy request not found" },
        { status: 404 }
      );
    }

    if (buddy.status !== "PENDING") {
      return NextResponse.json(
        { error: "This request has already been responded to" },
        { status: 400 }
      );
    }

    // Check capacity before accepting
    if (
      action === "accept" &&
      coworkingSession._count.buddies >= coworkingSession.maxBuddies
    ) {
      return NextResponse.json(
        { error: "Session is at full capacity" },
        { status: 400 }
      );
    }

    // Update buddy status
    const updatedBuddy = await prisma.coworkingBuddy.update({
      where: { id: buddyId },
      data: {
        status: action === "accept" ? "ACCEPTED" : "DECLINED",
      },
      select: {
        id: true,
        status: true,
        message: true,
        createdAt: true,
        updatedAt: true,
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

    // TODO: Send notification to the buddy about the decision

    // Get updated counts
    const acceptedCount = await prisma.coworkingBuddy.count({
      where: {
        sessionId,
        status: "ACCEPTED",
      },
    });

    return NextResponse.json({
      buddy: updatedBuddy,
      acceptedCount,
      spotsRemaining: coworkingSession.maxBuddies - acceptedCount,
    });
  } catch (error) {
    console.error("Error responding to buddy request:", error);
    return NextResponse.json(
      { error: "Failed to respond to request" },
      { status: 500 }
    );
  }
}
