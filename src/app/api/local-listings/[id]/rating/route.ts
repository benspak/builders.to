import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { rateLimit, RATE_LIMITS, rateLimitResponse } from "@/lib/rate-limit";

interface RouteParams {
  params: Promise<{ id: string }>;
}

/**
 * GET /api/local-listings/[id]/rating
 * Get user's rating for this listing's author
 */
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ rating: null });
    }

    const { id: listingId } = await params;

    const rating = await prisma.localListingRating.findUnique({
      where: {
        raterId_listingId: {
          raterId: session.user.id,
          listingId,
        },
      },
    });

    return NextResponse.json({ rating });
  } catch (error) {
    console.error("Error fetching rating:", error);
    return NextResponse.json(
      { error: "Failed to fetch rating" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/local-listings/[id]/rating
 * Rate the listing author
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
        { error: "You must be signed in to rate" },
        { status: 401 }
      );
    }

    const { id: listingId } = await params;
    const body = await request.json();
    const { rating, comment } = body;

    // Validate rating
    if (!rating || rating < 1 || rating > 5) {
      return NextResponse.json(
        { error: "Rating must be between 1 and 5" },
        { status: 400 }
      );
    }

    // Find the listing
    const listing = await prisma.localListing.findUnique({
      where: { id: listingId },
      select: { id: true, userId: true, status: true },
    });

    if (!listing) {
      return NextResponse.json(
        { error: "Listing not found" },
        { status: 404 }
      );
    }

    // Can't rate yourself
    if (listing.userId === session.user.id) {
      return NextResponse.json(
        { error: "You cannot rate your own listing" },
        { status: 403 }
      );
    }

    // Check if already rated
    const existingRating = await prisma.localListingRating.findUnique({
      where: {
        raterId_listingId: {
          raterId: session.user.id,
          listingId,
        },
      },
    });

    if (existingRating) {
      // Update existing rating
      const updatedRating = await prisma.localListingRating.update({
        where: { id: existingRating.id },
        data: {
          rating,
          comment: comment?.trim() || null,
        },
      });
      return NextResponse.json(updatedRating);
    }

    // Create new rating
    const newRating = await prisma.localListingRating.create({
      data: {
        rating,
        comment: comment?.trim() || null,
        raterId: session.user.id,
        ratedUserId: listing.userId,
        listingId,
      },
    });

    return NextResponse.json(newRating, { status: 201 });
  } catch (error) {
    console.error("Error creating rating:", error);
    return NextResponse.json(
      { error: "Failed to save rating" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/local-listings/[id]/rating
 * Remove your rating
 */
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "You must be signed in" },
        { status: 401 }
      );
    }

    const { id: listingId } = await params;

    const rating = await prisma.localListingRating.findUnique({
      where: {
        raterId_listingId: {
          raterId: session.user.id,
          listingId,
        },
      },
    });

    if (!rating) {
      return NextResponse.json(
        { error: "Rating not found" },
        { status: 404 }
      );
    }

    await prisma.localListingRating.delete({
      where: { id: rating.id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting rating:", error);
    return NextResponse.json(
      { error: "Failed to delete rating" },
      { status: 500 }
    );
  }
}
