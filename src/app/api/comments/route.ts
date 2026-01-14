import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { rateLimit, RATE_LIMITS, rateLimitResponse } from "@/lib/rate-limit";
import { extractMentions } from "@/lib/utils";
import { notifyNewComment, sendUserPushNotification } from "@/lib/push-notifications";

/**
 * Helper to find or create a FeedEvent for a project.
 * Uses the PROJECT_CREATED event as the canonical feed event for project comments.
 */
async function getOrCreateFeedEventForProject(projectId: string) {
  // First, try to find an existing PROJECT_CREATED feed event for this project
  let feedEvent = await prisma.feedEvent.findFirst({
    where: {
      projectId,
      type: "PROJECT_CREATED",
    },
    select: {
      id: true,
      userId: true,
      type: true,
      title: true,
    },
  });

  // If no PROJECT_CREATED feed event exists, create one
  if (!feedEvent) {
    const project = await prisma.project.findUnique({
      where: { id: projectId },
      select: {
        id: true,
        title: true,
        tagline: true,
        userId: true,
        createdAt: true,
      },
    });

    if (!project) {
      return null;
    }

    feedEvent = await prisma.feedEvent.create({
      data: {
        type: "PROJECT_CREATED",
        title: `New project: ${project.title}`,
        description: project.tagline || null,
        userId: project.userId,
        projectId: project.id,
        createdAt: project.createdAt, // Preserve original timestamp
      },
      select: {
        id: true,
        userId: true,
        type: true,
        title: true,
      },
    });
  }

  return feedEvent;
}

// GET /api/comments - Get comments for a project (via FeedEventComment)
export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    const { searchParams } = new URL(request.url);
    const projectId = searchParams.get("projectId");

    if (!projectId) {
      return NextResponse.json(
        { error: "Project ID is required" },
        { status: 400 }
      );
    }

    // Verify project exists
    const project = await prisma.project.findUnique({
      where: { id: projectId },
      select: { id: true },
    });

    if (!project) {
      return NextResponse.json(
        { error: "Project not found" },
        { status: 404 }
      );
    }

    // Get or create the feed event for this project
    const feedEvent = await getOrCreateFeedEventForProject(projectId);

    if (!feedEvent) {
      return NextResponse.json([]);
    }

    // Fetch comments from FeedEventComment
    const comments = await prisma.feedEventComment.findMany({
      where: { feedEventId: feedEvent.id },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        content: true,
        gifUrl: true,
        createdAt: true,
        updatedAt: true,
        userId: true,
        feedEventId: true,
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

    // Transform to match the expected format (with placeholder like data for compatibility)
    const commentsWithLikeStatus = comments.map(comment => ({
      id: comment.id,
      content: comment.content,
      createdAt: comment.createdAt,
      updatedAt: comment.updatedAt,
      userId: comment.userId,
      projectId: projectId, // Add projectId for compatibility
      user: {
        ...comment.user,
        // Compute display name for compatibility
        name: comment.user.firstName && comment.user.lastName
          ? `${comment.user.firstName} ${comment.user.lastName}`
          : comment.user.name,
      },
      likesCount: 0, // FeedEventComment doesn't have likes, set to 0 for compatibility
      isLiked: false,
    }));

    return NextResponse.json(commentsWithLikeStatus);
  } catch (error) {
    console.error("Error fetching comments:", error);
    return NextResponse.json(
      { error: "Failed to fetch comments" },
      { status: 500 }
    );
  }
}

// POST /api/comments - Create a new comment on a project (via FeedEventComment)
export async function POST(request: NextRequest) {
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

    const body = await request.json();
    const { projectId, content, gifUrl } = body;

    if (!projectId || !content) {
      return NextResponse.json(
        { error: "Project ID and content are required" },
        { status: 400 }
      );
    }

    // Check if project exists and get owner info
    const project = await prisma.project.findUnique({
      where: { id: projectId },
      select: {
        id: true,
        title: true,
        slug: true,
        userId: true,
      },
    });

    if (!project) {
      return NextResponse.json(
        { error: "Project not found" },
        { status: 404 }
      );
    }

    // Get or create the feed event for this project
    const feedEvent = await getOrCreateFeedEventForProject(projectId);

    if (!feedEvent) {
      return NextResponse.json(
        { error: "Failed to process comment" },
        { status: 500 }
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

    // Create comment in FeedEventComment
    const comment = await prisma.feedEventComment.create({
      data: {
        content: content.trim(),
        gifUrl: gifUrl || null,
        userId: session.user.id,
        feedEventId: feedEvent.id,
      },
      select: {
        id: true,
        content: true,
        gifUrl: true,
        createdAt: true,
        updatedAt: true,
        userId: true,
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
    const truncatedContent = content.length > 100
      ? content.substring(0, 100) + "..."
      : content;

    // Create notification for project owner (if not self-comment)
    if (project.userId !== session.user.id) {
      await prisma.notification.create({
        data: {
          type: "FEED_EVENT_COMMENTED",
          title: `${commenterName} commented on your project`,
          message: truncatedContent,
          userId: project.userId,
          projectId: project.id,
          feedEventId: feedEvent.id,
          feedEventCommentId: comment.id,
          actorId: session.user.id,
          actorName: commenterName,
          actorImage: currentUser?.image,
        },
      });

      // Send push notification
      const projectUrl = project.slug ? `/projects/${project.slug}` : '/projects';
      notifyNewComment(
        project.userId,
        commenterName,
        project.title,
        projectUrl
      ).catch(console.error);
    }

    // Extract and process @mentions
    const mentionedSlugs = extractMentions(content);

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

      // Create notifications for mentioned users (except project owner who already got notified)
      const mentionNotifications = mentionedUsers
        .filter(user => user.id !== project.userId)
        .map(mentionedUser => ({
          type: "USER_MENTIONED" as const,
          title: `${commenterName} mentioned you in a comment`,
          message: truncatedContent,
          userId: mentionedUser.id,
          projectId: project.id,
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
        const projectUrl = project.slug ? `/projects/${project.slug}` : '/projects';
        for (const notification of mentionNotifications) {
          sendUserPushNotification(notification.userId, {
            title: 'You were mentioned',
            body: `${commenterName} mentioned you in a comment`,
            url: projectUrl,
            tag: 'mention',
          }).catch(console.error);
        }
      }
    }

    // Return in the expected format for compatibility
    const responseComment = {
      id: comment.id,
      content: comment.content,
      createdAt: comment.createdAt,
      updatedAt: comment.updatedAt,
      userId: comment.userId,
      projectId: projectId,
      user: {
        ...comment.user,
        name: comment.user.firstName && comment.user.lastName
          ? `${comment.user.firstName} ${comment.user.lastName}`
          : comment.user.name,
      },
      likesCount: 0,
      isLiked: false,
    };

    return NextResponse.json(responseComment, { status: 201 });
  } catch (error) {
    console.error("Error creating comment:", error);
    return NextResponse.json(
      { error: "Failed to create comment" },
      { status: 500 }
    );
  }
}
