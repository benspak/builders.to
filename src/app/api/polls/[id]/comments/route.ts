import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { rateLimit, RATE_LIMITS, rateLimitResponse } from "@/lib/rate-limit";

// GET /api/polls/[id]/comments - Get comments for a poll
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: pollId } = await params;
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get("limit") || "20", 10);
    const cursor = searchParams.get("cursor");

    const comments = await prisma.pollComment.findMany({
      where: { pollId },
      orderBy: { createdAt: "asc" },
      take: Math.min(limit, 50),
      ...(cursor && {
        skip: 1,
        cursor: { id: cursor },
      }),
      include: {
        user: {
          select: {
            id: true,
            name: true,
            displayName: true,
            firstName: true,
            lastName: true,
            image: true,
            slug: true,
          },
        },
      },
    });

    const nextCursor = comments.length === limit ? comments[comments.length - 1]?.id : null;

    return NextResponse.json({
      comments,
      nextCursor,
    });
  } catch (error) {
    console.error("Error fetching poll comments:", error);
    return NextResponse.json(
      { error: "Failed to fetch comments" },
      { status: 500 }
    );
  }
}

// POST /api/polls/[id]/comments - Add a comment to a poll
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

    const { id: pollId } = await params;
    const body = await request.json();
    const { content, gifUrl } = body;

    if (!content || content.trim().length === 0) {
      return NextResponse.json(
        { error: "Comment content is required" },
        { status: 400 }
      );
    }

    if (content.length > 1000) {
      return NextResponse.json(
        { error: "Comment must be 1000 characters or less" },
        { status: 400 }
      );
    }

    // Check if poll exists
    const poll = await prisma.poll.findUnique({
      where: { id: pollId },
      select: { id: true, userId: true },
    });

    if (!poll) {
      return NextResponse.json(
        { error: "Poll not found" },
        { status: 404 }
      );
    }

    // Create comment
    const comment = await prisma.pollComment.create({
      data: {
        content: content.trim(),
        gifUrl: gifUrl || null,
        userId: session.user.id,
        pollId,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            displayName: true,
            firstName: true,
            lastName: true,
            image: true,
            slug: true,
          },
        },
      },
    });

    // Create notification for poll owner if commenter is not the owner
    if (poll.userId !== session.user.id) {
      const currentUser = await prisma.user.findUnique({
        where: { id: session.user.id },
        select: { firstName: true, lastName: true, name: true, image: true },
      });

      const actorName = currentUser?.firstName && currentUser?.lastName
        ? `${currentUser.firstName} ${currentUser.lastName}`
        : currentUser?.name || "Someone";

      await prisma.notification.create({
        data: {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          type: "FEED_EVENT_COMMENTED" as any, // Reuse existing type
          title: `${actorName} commented on your poll`,
          message: content.length > 100 ? content.slice(0, 100) + "..." : content,
          userId: poll.userId,
          pollId,
          actorId: session.user.id,
          actorName,
          actorImage: currentUser?.image || null,
        },
      });
    }

    return NextResponse.json(comment, { status: 201 });
  } catch (error) {
    console.error("Error creating poll comment:", error);
    return NextResponse.json(
      { error: "Failed to create comment" },
      { status: 500 }
    );
  }
}
