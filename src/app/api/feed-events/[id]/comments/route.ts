import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { rateLimit, RATE_LIMITS, rateLimitResponse } from "@/lib/rate-limit";
import { extractMentions } from "@/lib/utils";

// GET /api/feed-events/[id]/comments - Get comments for a feed event
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: feedEventId } = await params;

    const comments = await prisma.feedEventComment.findMany({
      where: { feedEventId },
      orderBy: { createdAt: "asc" },
      select: {
        id: true,
        content: true,
        gifUrl: true,
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

    return NextResponse.json(comments);
  } catch (error) {
    console.error("Error fetching feed event comments:", error);
    return NextResponse.json(
      { error: "Failed to fetch comments" },
      { status: 500 }
    );
  }
}

// POST /api/feed-events/[id]/comments - Create a new comment on a feed event
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

    const { id: feedEventId } = await params;
    const body = await request.json();
    const { content, gifUrl } = body;

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

    // Check if feed event exists and get the owner info
    const feedEvent = await prisma.feedEvent.findUnique({
      where: { id: feedEventId },
      select: {
        id: true,
        type: true,
        title: true,
        userId: true,
        projectId: true,
        milestone: {
          select: {
            project: {
              select: {
                userId: true,
              },
            },
          },
        },
      },
    });

    if (!feedEvent) {
      return NextResponse.json(
        { error: "Feed event not found" },
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

    const comment = await prisma.feedEventComment.create({
      data: {
        content: content.trim(),
        gifUrl: gifUrl || null,
        userId: session.user.id,
        feedEventId,
      },
      select: {
        id: true,
        content: true,
        gifUrl: true,
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

    const commenterName = currentUser?.firstName && currentUser?.lastName
      ? `${currentUser.firstName} ${currentUser.lastName}`
      : currentUser?.name || "Someone";

    // Truncate comment content for notification message
    const truncatedContent = content.trim().length > 100
      ? content.trim().substring(0, 100) + "..."
      : content.trim();

    // Determine the feed event owner (could be the user who triggered it or project owner)
    const feedEventOwnerId = feedEvent.milestone?.project?.userId || feedEvent.userId;

    // Create a friendly event type description
    const eventTypeDescription = getEventTypeDescription(feedEvent.type);

    // Create notification for feed event owner (if not self-comment)
    if (feedEventOwnerId !== session.user.id) {
      await prisma.notification.create({
        data: {
          type: "FEED_EVENT_COMMENTED",
          title: `${commenterName} commented on your ${eventTypeDescription}`,
          message: truncatedContent,
          userId: feedEventOwnerId,
          feedEventId: feedEvent.id,
          feedEventCommentId: comment.id,
          actorId: session.user.id,
          actorName: commenterName,
          actorImage: currentUser?.image,
        },
      });
    }

    // Extract and process @mentions
    const mentionedSlugs = extractMentions(content.trim());

    if (mentionedSlugs.length > 0) {
      // Find users by their slugs
      const mentionedUsers = await prisma.user.findMany({
        where: {
          slug: { in: mentionedSlugs },
          // Don't notify the commenter if they mention themselves
          id: { not: session.user.id },
        },
        select: { id: true, slug: true },
      });

      // Create notifications for mentioned users (except feed event owner who already got notified)
      const mentionNotifications = mentionedUsers
        .filter(user => user.id !== feedEventOwnerId)
        .map(mentionedUser => ({
          type: "USER_MENTIONED" as const,
          title: `${commenterName} mentioned you in a comment`,
          message: truncatedContent,
          userId: mentionedUser.id,
          feedEventId: feedEvent.id,
          feedEventCommentId: comment.id,
          actorId: session.user.id,
          actorName: commenterName,
          actorImage: currentUser?.image,
        }));

      if (mentionNotifications.length > 0) {
        await prisma.notification.createMany({
          data: mentionNotifications,
        });
      }
    }

    return NextResponse.json(comment, { status: 201 });
  } catch (error) {
    console.error("Error creating feed event comment:", error);
    return NextResponse.json(
      { error: "Failed to create comment" },
      { status: 500 }
    );
  }
}

// Helper function to get user-friendly event type descriptions
function getEventTypeDescription(type: string): string {
  switch (type) {
    case "MILESTONE_ACHIEVED":
      return "milestone";
    case "PROJECT_LAUNCHED":
      return "project launch";
    case "PROJECT_ACQUIRED":
      return "project acquisition";
    case "STATUS_UPDATE":
      return "status update";
    case "PROJECT_STATUS_CHANGE":
      return "project update";
    case "PROJECT_CREATED":
      return "new project";
    case "JOB_POSTED":
      return "job posting";
    case "USER_JOINED":
      return "welcome post";
    default:
      return "update";
  }
}
