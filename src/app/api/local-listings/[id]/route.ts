import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { generateLocationSlug } from "@/lib/utils";

interface RouteParams {
  params: Promise<{ id: string }>;
}

/**
 * GET /api/local-listings/[id]
 * Get a single listing by ID or slug
 */
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;

    // Try to find by ID first, then by slug
    let listing = await prisma.localListing.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            displayName: true,
            image: true,
            slug: true,
            headline: true,
            createdAt: true,
            _count: {
              select: {
                localListings: {
                  where: { status: "ACTIVE" },
                },
              },
            },
          },
        },
        images: {
          orderBy: { order: "asc" },
        },
        _count: {
          select: {
            comments: true,
            flags: true,
          },
        },
      },
    });

    // If not found by ID, try slug
    if (!listing) {
      listing = await prisma.localListing.findUnique({
        where: { slug: id },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              displayName: true,
              image: true,
              slug: true,
              headline: true,
              createdAt: true,
              _count: {
                select: {
                  localListings: {
                    where: { status: "ACTIVE" },
                  },
                },
              },
            },
          },
          images: {
            orderBy: { order: "asc" },
          },
          _count: {
            select: {
              comments: true,
              flags: true,
            },
          },
        },
      });
    }

    if (!listing) {
      return NextResponse.json(
        { error: "Listing not found" },
        { status: 404 }
      );
    }

    // Check if user can view this listing
    const session = await auth();
    const isOwner = session?.user?.id === listing.userId;

    // Non-owners can only see active listings
    if (!isOwner && listing.status !== "ACTIVE") {
      return NextResponse.json(
        { error: "Listing not found" },
        { status: 404 }
      );
    }

    // Check if expired
    if (!isOwner && listing.expiresAt && new Date(listing.expiresAt) < new Date()) {
      return NextResponse.json(
        { error: "This listing has expired" },
        { status: 410 }
      );
    }

    // Get user's rating stats if available
    const ratingStats = await prisma.localListingRating.aggregate({
      where: { ratedUserId: listing.userId },
      _avg: { rating: true },
      _count: { rating: true },
    });

    return NextResponse.json({
      ...listing,
      isOwner,
      userRating: {
        average: ratingStats._avg.rating || 0,
        count: ratingStats._count.rating || 0,
      },
    });
  } catch (error) {
    console.error("Error fetching listing:", error);
    return NextResponse.json(
      { error: "Failed to fetch listing" },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/local-listings/[id]
 * Update a listing
 */
export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "You must be signed in to update a listing" },
        { status: 401 }
      );
    }

    const { id } = await params;

    // Find the listing
    const listing = await prisma.localListing.findUnique({
      where: { id },
    });

    if (!listing) {
      return NextResponse.json(
        { error: "Listing not found" },
        { status: 404 }
      );
    }

    // Check ownership
    if (listing.userId !== session.user.id) {
      return NextResponse.json(
        { error: "You don't have permission to update this listing" },
        { status: 403 }
      );
    }

    const body = await request.json();
    const {
      title,
      description,
      city,
      state,
      zipCode,
      contactUrl,
      priceInCents,
      images,
    } = body;

    // Generate location slug if city/state changed
    let locationSlug = listing.locationSlug;
    if (city && state && (city !== listing.city || state !== listing.state)) {
      locationSlug = generateLocationSlug(`${city}, ${state}`);
    }

    // Update listing
    const updatedListing = await prisma.$transaction(async (tx) => {
      // Update images if provided
      if (images !== undefined) {
        // Delete existing images
        await tx.localListingImage.deleteMany({
          where: { listingId: id },
        });

        // Create new images
        if (images?.length) {
          await tx.localListingImage.createMany({
            data: images.map((img: { url: string; caption?: string }, index: number) => ({
              listingId: id,
              url: img.url,
              caption: img.caption,
              order: index,
            })),
          });
        }
      }

      // Update the listing
      return tx.localListing.update({
        where: { id },
        data: {
          ...(title && { title }),
          ...(description && { description }),
          ...(city && { city }),
          ...(state && { state }),
          ...(locationSlug && { locationSlug }),
          ...(zipCode !== undefined && { zipCode }),
          ...(contactUrl !== undefined && { contactUrl }),
          ...(priceInCents !== undefined && listing.category === "SERVICES" && { priceInCents }),
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
          images: {
            orderBy: { order: "asc" },
          },
        },
      });
    });

    return NextResponse.json(updatedListing);
  } catch (error) {
    console.error("Error updating listing:", error);
    return NextResponse.json(
      { error: "Failed to update listing" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/local-listings/[id]
 * Delete a listing
 */
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "You must be signed in to delete a listing" },
        { status: 401 }
      );
    }

    const { id } = await params;

    // Find the listing
    const listing = await prisma.localListing.findUnique({
      where: { id },
    });

    if (!listing) {
      return NextResponse.json(
        { error: "Listing not found" },
        { status: 404 }
      );
    }

    // Check ownership
    if (listing.userId !== session.user.id) {
      return NextResponse.json(
        { error: "You don't have permission to delete this listing" },
        { status: 403 }
      );
    }

    // Delete the listing (cascade will handle images, comments, flags)
    await prisma.localListing.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting listing:", error);
    return NextResponse.json(
      { error: "Failed to delete listing" },
      { status: 500 }
    );
  }
}
