import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { rateLimit, RATE_LIMITS, rateLimitResponse } from "@/lib/rate-limit";
import { extractMentions } from "@/lib/utils";
import { notifyNewComment, sendUserPushNotification } from "@/lib/push-notifications";

interface RouteParams {
  params: Promise<{ id: string }>;
}

/**
 * Helper to find or create a FeedEvent for a listing.
 * This ensures all listings have a feed event for unified comments.
 */
async function getOrCreateFeedEventForListing(listingId: string) {
  // First, try to find an existing feed event for this listing
  let feedEvent = await prisma.feedEvent.findFirst({
    where: { localListingId: listingId },
    select: {
      id: true,
      userId: true,
      type: true,
      title: true,
    },
  });

  // If no feed event exists, create one
  if (!feedEvent) {
    const listing = await prisma.localListing.findUnique({
      where: { id: listingId },
      select: {
        id: true,
        title: true,
        description: true,
        userId: true,
        createdAt: true,
      },
    });

    if (!listing) {
      return null;
    }

    feedEvent = await prisma.feedEvent.create({
      data: {
        type: "LISTING_CREATED",
        title: `New listing: ${listing.title}`,
        description: listing.description.slice(0, 500),
        userId: listing.userId,
        localListingId: listing.id,
        createdAt: listing.createdAt, // Preserve original timestamp
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

/**
 * GET /api/local-listings/[id]/comments
 * Get comments for a listing (via FeedEventComment)
 */
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id: listingId } = await params;
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const skip = (page - 1) * limit;

    // Verify listing exists and is accessible
    const listing = await prisma.localListing.findUnique({
      where: { id: listingId },
      select: { id: true, status: true, userId: true },
    });

    if (!listing) {
      return NextResponse.json(
        { error: "Listing not found" },
        { status: 404 }
      );
    }

    // Check if user can view comments
    const session = await auth();
    const isOwner = session?.user?.id === listing.userId;

    if (!isOwner && listing.status !== "ACTIVE") {
      return NextResponse.json(
        { error: "Listing not found" },
        { status: 404 }
      );
    }

    // Get or create the feed event for this listing
    const feedEvent = await getOrCreateFeedEventForListing(listingId);

    if (!feedEvent) {
      return NextResponse.json({
        comments: [],
        pagination: {
          page,
          limit,
          total: 0,
          totalPages: 0,
        },
      });
    }

    // Fetch comments from FeedEventComment with poll data
    const [comments, total] = await Promise.all([
      prisma.feedEventComment.findMany({
        where: { feedEventId: feedEvent.id },
        orderBy: { createdAt: "asc" },
        skip,
        take: limit,
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
              displayName: true,
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
      }),
      prisma.feedEventComment.count({ where: { feedEventId: feedEvent.id } }),
    ]);

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

    return NextResponse.json({
      comments: commentsWithVotes,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching comments:", error);
    return NextResponse.json(
      { error: "Failed to fetch comments" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/local-listings/[id]/comments
 * Add a comment to a listing (via FeedEventComment)
 */
export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    // Rate limit check
    const { success, reset } = rateLimit(request, RATE_LIMITS.comment);
    if (!success) {
      return rateLimitResponse(reset);
    }

    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "You must be signed in to comment" },
        { status: 401 }
      );
    }

    const { id: listingId } = await params;
    const body = await request.json();
    const { content, gifUrl, imageUrl, videoUrl, pollOptions } = body;

    // Allow submit if there's text OR media
    if (!content?.trim() && !gifUrl && !imageUrl) {
      return NextResponse.json(
        { error: "Content or media is required" },
        { status: 400 }
      );
    }

    if (content && content.length > 2000) {
      return NextResponse.json(
        { error: "Comment is too long (max 2000 characters)" },
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

    // Verify listing exists and is active
    const listing = await prisma.localListing.findUnique({
      where: { id: listingId },
      select: { id: true, status: true, userId: true, title: true, slug: true },
    });

    if (!listing) {
      return NextResponse.json(
        { error: "Listing not found" },
        { status: 404 }
      );
    }

    if (listing.status !== "ACTIVE") {
      return NextResponse.json(
        { error: "Cannot comment on this listing" },
        { status: 403 }
      );
    }

    // Get or create the feed event for this listing
    const feedEvent = await getOrCreateFeedEventForListing(listingId);

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

    // Calculate poll expiration (7 days from now) if poll is included
    let pollExpiresAt: Date | null = null;
    if (validatedPollOptions) {
      pollExpiresAt = new Date();
      pollExpiresAt.setDate(pollExpiresAt.getDate() + 7);
    }

    // Create comment in FeedEventComment
    const comment = await prisma.feedEventComment.create({
      data: {
        content: content?.trim() || " ",
        gifUrl: gifUrl || null,
        imageUrl: imageUrl || null,
        videoUrl: videoUrl || null,
        userId: session.user.id,
        feedEventId: feedEvent.id,
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
            displayName: true,
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

    // Create notification for listing owner (if not self-comment)
    if (listing.userId !== session.user.id) {
      await prisma.notification.create({
        data: {
          type: "FEED_EVENT_COMMENTED",
          title: `${commenterName} commented on your listing`,
          message: truncatedContent,
          userId: listing.userId,
          feedEventId: feedEvent.id,
          feedEventCommentId: comment.id,
          actorId: session.user.id,
          actorName: commenterName,
          actorImage: currentUser?.image,
        },
      });

      // Send push notification
      const listingUrl = listing.slug ? `/local/${listing.slug}` : '/local';
      notifyNewComment(
        listing.userId,
        commenterName,
        listing.title,
        listingUrl
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

      // Create notifications for mentioned users (except listing owner who already got notified)
      const mentionNotifications = mentionedUsers
        .filter(user => user.id !== listing.userId)
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

        // Send push notifications to mentioned users - link to listing with comment anchor
        const listingUrl = listing.slug
          ? `/local/${listing.slug}#comment-${comment.id}`
          : '/local';
        for (const notification of mentionNotifications) {
          sendUserPushNotification(notification.userId, {
            title: 'You were mentioned',
            body: `${commenterName} mentioned you in a comment`,
            url: listingUrl,
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
    console.error("Error creating comment:", error);
    return NextResponse.json(
      { error: "Failed to create comment" },
      { status: 500 }
    );
  }
}
