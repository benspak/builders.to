import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { rateLimit, RATE_LIMITS, rateLimitResponse } from "@/lib/rate-limit";
import { extractMentions } from "@/lib/utils";

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

    // Fetch comments from FeedEventComment
    const [comments, total] = await Promise.all([
      prisma.feedEventComment.findMany({
        where: { feedEventId: feedEvent.id },
        orderBy: { createdAt: "asc" },
        skip,
        take: limit,
        select: {
          id: true,
          content: true,
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
        },
      }),
      prisma.feedEventComment.count({ where: { feedEventId: feedEvent.id } }),
    ]);

    return NextResponse.json({
      comments,
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
    const { content } = body;

    if (!content || content.trim().length === 0) {
      return NextResponse.json(
        { error: "Comment content is required" },
        { status: 400 }
      );
    }

    if (content.length > 2000) {
      return NextResponse.json(
        { error: "Comment is too long (max 2000 characters)" },
        { status: 400 }
      );
    }

    // Verify listing exists and is active
    const listing = await prisma.localListing.findUnique({
      where: { id: listingId },
      select: { id: true, status: true, userId: true, title: true },
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

    // Create comment in FeedEventComment
    const comment = await prisma.feedEventComment.create({
      data: {
        content: content.trim(),
        userId: session.user.id,
        feedEventId: feedEvent.id,
      },
      select: {
        id: true,
        content: true,
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
      }
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
