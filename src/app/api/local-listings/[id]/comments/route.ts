import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { rateLimit, RATE_LIMITS, rateLimitResponse } from "@/lib/rate-limit";

interface RouteParams {
  params: Promise<{ id: string }>;
}

/**
 * GET /api/local-listings/[id]/comments
 * Get comments for a listing
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

    const [comments, total] = await Promise.all([
      prisma.localListingComment.findMany({
        where: { listingId },
        orderBy: { createdAt: "asc" },
        skip,
        take: limit,
        include: {
          user: {
            select: {
              id: true,
              name: true,
              displayName: true,
              image: true,
              slug: true,
            },
          },
        },
      }),
      prisma.localListingComment.count({ where: { listingId } }),
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
 * Add a comment to a listing
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
      select: { id: true, status: true },
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

    const comment = await prisma.localListingComment.create({
      data: {
        content: content.trim(),
        userId: session.user.id,
        listingId,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            displayName: true,
            image: true,
            slug: true,
          },
        },
      },
    });

    return NextResponse.json(comment, { status: 201 });
  } catch (error) {
    console.error("Error creating comment:", error);
    return NextResponse.json(
      { error: "Failed to create comment" },
      { status: 500 }
    );
  }
}
