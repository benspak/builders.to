import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { rateLimit, RATE_LIMITS, rateLimitResponse } from "@/lib/rate-limit";

// GET /api/updates/[id]/comments - Get comments for an update
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: updateId } = await params;

    const comments = await prisma.updateComment.findMany({
      where: { updateId },
      orderBy: { createdAt: "asc" },
      include: {
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

    return NextResponse.json(comments);
  } catch (error) {
    console.error("Error fetching comments:", error);
    return NextResponse.json(
      { error: "Failed to fetch comments" },
      { status: 500 }
    );
  }
}

// POST /api/updates/[id]/comments - Create a new comment on an update
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Rate limit check
    const { success, reset } = rateLimit(request, RATE_LIMITS.comment);
    if (!success) {
      return rateLimitResponse(reset);
    }

    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { id: updateId } = await params;
    const body = await request.json();
    const { content } = body;

    if (!content || content.trim().length === 0) {
      return NextResponse.json(
        { error: "Content is required" },
        { status: 400 }
      );
    }

    if (content.length > 1000) {
      return NextResponse.json(
        { error: "Comment must be 1000 characters or less" },
        { status: 400 }
      );
    }

    // Check if update exists and get owner info
    const update = await prisma.dailyUpdate.findUnique({
      where: { id: updateId },
      select: {
        id: true,
        content: true,
        userId: true,
      },
    });

    if (!update) {
      return NextResponse.json(
        { error: "Update not found" },
        { status: 404 }
      );
    }

    // Get current user info for notification
    const currentUser = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        name: true,
        firstName: true,
        lastName: true,
        image: true,
      },
    });

    const comment = await prisma.updateComment.create({
      data: {
        content: content.trim(),
        userId: session.user.id,
        updateId,
      },
      include: {
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

    // Create notification for update owner (if not self-comment)
    if (update.userId !== session.user.id) {
      const commenterName = currentUser?.firstName && currentUser?.lastName
        ? `${currentUser.firstName} ${currentUser.lastName}`
        : currentUser?.name || "Someone";

      // Truncate comment content for notification message
      const truncatedContent = content.trim().length > 100
        ? content.trim().substring(0, 100) + "..."
        : content.trim();

      await prisma.notification.create({
        data: {
          type: "UPDATE_COMMENTED",
          title: `${commenterName} commented on your update`,
          message: truncatedContent,
          userId: update.userId,
          updateId: update.id,
          actorId: session.user.id,
          actorName: commenterName,
          actorImage: currentUser?.image,
        },
      });
    }

    return NextResponse.json(comment, { status: 201 });
  } catch (error) {
    console.error("Error creating comment:", error);
    return NextResponse.json(
      { error: "Failed to create comment" },
      { status: 500 }
    );
  }
}
