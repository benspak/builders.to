import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { LocalListingFlagReason } from "@prisma/client";
import { rateLimit, RATE_LIMITS, rateLimitResponse } from "@/lib/rate-limit";

interface RouteParams {
  params: Promise<{ id: string }>;
}

// Number of flags before a listing gets auto-flagged status
const FLAG_THRESHOLD = 3;

/**
 * POST /api/local-listings/[id]/flag
 * Report/flag a listing
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
        { error: "You must be signed in to report a listing" },
        { status: 401 }
      );
    }

    const { id: listingId } = await params;
    const body = await request.json();
    const { reason, description } = body;

    // Validate reason
    const validReasons = Object.values(LocalListingFlagReason);
    if (!reason || !validReasons.includes(reason)) {
      return NextResponse.json(
        { error: "Valid reason is required" },
        { status: 400 }
      );
    }

    // Verify listing exists
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

    // Can't flag your own listing
    if (listing.userId === session.user.id) {
      return NextResponse.json(
        { error: "You cannot flag your own listing" },
        { status: 403 }
      );
    }

    // Check if user already flagged this listing
    const existingFlag = await prisma.localListingFlag.findUnique({
      where: {
        userId_listingId: {
          userId: session.user.id,
          listingId,
        },
      },
    });

    if (existingFlag) {
      return NextResponse.json(
        { error: "You have already reported this listing" },
        { status: 409 }
      );
    }

    // Create the flag
    const flag = await prisma.localListingFlag.create({
      data: {
        reason,
        description: description?.trim() || null,
        userId: session.user.id,
        listingId,
      },
    });

    // Check if listing should be auto-flagged (threshold reached)
    const flagCount = await prisma.localListingFlag.count({
      where: { listingId },
    });

    if (flagCount >= FLAG_THRESHOLD && listing.status === "ACTIVE") {
      await prisma.localListing.update({
        where: { id: listingId },
        data: { status: "FLAGGED" },
      });
    }

    return NextResponse.json({
      success: true,
      flagId: flag.id,
      message: "Thank you for reporting this listing. We will review it shortly.",
    }, { status: 201 });
  } catch (error) {
    console.error("Error flagging listing:", error);
    return NextResponse.json(
      { error: "Failed to report listing" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/local-listings/[id]/flag
 * Remove your flag from a listing
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

    // Delete the flag if it exists
    const flag = await prisma.localListingFlag.findUnique({
      where: {
        userId_listingId: {
          userId: session.user.id,
          listingId,
        },
      },
    });

    if (!flag) {
      return NextResponse.json(
        { error: "Flag not found" },
        { status: 404 }
      );
    }

    await prisma.localListingFlag.delete({
      where: { id: flag.id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error removing flag:", error);
    return NextResponse.json(
      { error: "Failed to remove flag" },
      { status: 500 }
    );
  }
}
