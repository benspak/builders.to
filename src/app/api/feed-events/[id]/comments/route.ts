import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { rateLimit, RATE_LIMITS, rateLimitResponse } from "@/lib/rate-limit";
import { extractMentions } from "@/lib/utils";
import { notifyNewComment, sendUserPushNotification } from "@/lib/push-notifications";

// GET /api/feed-events/[id]/comments - Get comments for a feed event
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    const { id: feedEventId } = await params;

    const comments = await prisma.feedEventComment.findMany({
      where: { feedEventId },
      orderBy: { createdAt: "asc" },
      select: {
        id: true,
        content: true,
        gifUrl: true,
        imageUrl: true,
        videoUrl: true,
        pollQuestion: true,
        pollExpiresAt: true,
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
        pollOptions: {
          orderBy: { order: "asc" },
          select: {
            id: true,
            text: true,
            order: true,
            _count: {
              select: { votes: true },
            },
          },
        },
      },
    });

    // Get user's votes if logged in
    let userVotes: { commentId: string; optionId: string }[] = [];
    if (session?.user?.id) {
      const votes = await prisma.feedEventCommentPollVote.findMany({
        where: {
          userId: session.user.id,
          commentId: { in: comments.map(c => c.id) },
        },
        select: { commentId: true, optionId: true },
      });
      userVotes = votes;
    }

    // Add votedOptionId to each comment
    const commentsWithVotes = comments.map(comment => ({
      ...comment,
      votedOptionId: userVotes.find(v => v.commentId === comment.id)?.optionId || null,
    }));

    return NextResponse.json(commentsWithVotes);
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
    const { content, gifUrl, imageUrl, videoUrl, pollOptions } = body;

    // Allow submit if there's text OR media
    if (!content?.trim() && !gifUrl && !imageUrl) {
      return NextResponse.json(
        { error: "Content or media is required" },
        { status: 400 }
      );
    }

    if (content && content.length > 1000) {
      return NextResponse.json(
        { error: "Comment must be 1000 characters or less" },
        { status: 400 }
      );
    }

    // Validate poll options if provided
    let validatedPollOptions: { text: string; order: number }[] | null = null;
    if (pollOptions && Array.isArray(pollOptions) && pollOptions.length > 0) {
      if (pollOptions.length < 2) {
        return NextResponse.json(
          { error: "At least 2 poll options are required" },
          { status: 400 }
        );
      }
      if (pollOptions.length > 5) {
        return NextResponse.json(
          { error: "Maximum 5 poll options allowed" },
          { status: 400 }
        );
      }

      validatedPollOptions = pollOptions.map((opt: string, index: number) => {
        const text = typeof opt === "string" ? opt.trim() : "";
        if (!text || text.length === 0) {
          throw new Error(`Option ${index + 1} is empty`);
        }
        if (text.length > 50) {
          throw new Error(`Option ${index + 1} must be 50 characters or less`);
        }
        return { text, order: index };
      });
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

    // Calculate poll expiration (7 days from now) if poll is included
    let pollExpiresAt: Date | null = null;
    if (validatedPollOptions) {
      pollExpiresAt = new Date();
      pollExpiresAt.setDate(pollExpiresAt.getDate() + 7);
    }

    const comment = await prisma.feedEventComment.create({
      data: {
        content: content?.trim() || " ",
        gifUrl: gifUrl || null,
        imageUrl: imageUrl || null,
        videoUrl: videoUrl || null,
        userId: session.user.id,
        feedEventId,
        // Poll fields
        pollQuestion: validatedPollOptions ? (content?.trim() || "Poll") : null,
        pollExpiresAt: pollExpiresAt,
        // Create poll options if present
        ...(validatedPollOptions && {
          pollOptions: {
            create: validatedPollOptions,
          },
        }),
      },
      select: {
        id: true,
        content: true,
        gifUrl: true,
        imageUrl: true,
        videoUrl: true,
        pollQuestion: true,
        pollExpiresAt: true,
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
        pollOptions: {
          orderBy: { order: "asc" },
          select: {
            id: true,
            text: true,
            order: true,
            _count: {
              select: { votes: true },
            },
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

      // Send push notification
      notifyNewComment(
        feedEventOwnerId,
        commenterName,
        feedEvent.title,
        '/feed'
      ).catch(console.error);
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

        // Send push notifications to mentioned users
        for (const notification of mentionNotifications) {
          sendUserPushNotification(notification.userId, {
            title: 'You were mentioned',
            body: `${commenterName} mentioned you in a comment`,
            url: '/feed',
            tag: 'mention',
          }).catch(console.error);
        }
      }
    }

    // Add votedOptionId for consistency
    const responseComment = {
      ...comment,
      votedOptionId: null,
    };

    return NextResponse.json(responseComment, { status: 201 });
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
