import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import {
  spendTokens,
  hasEnoughTokens,
  LOCAL_LISTING_REDEMPTION_COST,
  getBalance
} from "@/lib/tokens";
import { LOCAL_LISTING_PAID_DURATION_DAYS } from "@/lib/stripe";

interface RouteParams {
  params: Promise<{ id: string }>;
}

/**
 * POST /api/local-listings/[id]/redeem
 * Redeem tokens to activate a local listing (for SERVICES category)
 */
export async function POST(request: Request, { params }: RouteParams) {
  try {
    const session = await auth();
    const { id } = await params;

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "You must be signed in to redeem tokens" },
        { status: 401 }
      );
    }

    // Verify the local listing exists and belongs to the user
    const listing = await prisma.localListing.findUnique({
      where: { id },
    });

    if (!listing) {
      return NextResponse.json(
        { error: "Local listing not found" },
        { status: 404 }
      );
    }

    if (listing.userId !== session.user.id) {
      return NextResponse.json(
        { error: "You can only redeem tokens for your own listings" },
        { status: 403 }
      );
    }

    // Only SERVICES category requires payment
    if (listing.category !== "SERVICES") {
      return NextResponse.json(
        { error: "Only SERVICES category listings require payment" },
        { status: 400 }
      );
    }

    // Only allow redemption for DRAFT, EXPIRED, or PENDING_PAYMENT listings
    if (!["DRAFT", "EXPIRED", "PENDING_PAYMENT"].includes(listing.status)) {
      return NextResponse.json(
        { error: `Cannot redeem tokens for ${listing.status} listing` },
        { status: 400 }
      );
    }

    // Check if user has enough tokens
    const hasTokens = await hasEnoughTokens(session.user.id, LOCAL_LISTING_REDEMPTION_COST);
    if (!hasTokens) {
      const balance = await getBalance(session.user.id);
      return NextResponse.json(
        {
          error: "Insufficient tokens",
          required: LOCAL_LISTING_REDEMPTION_COST,
          balance,
        },
        { status: 400 }
      );
    }

    // Spend the tokens
    const { balance, transactionId } = await spendTokens(
      session.user.id,
      LOCAL_LISTING_REDEMPTION_COST,
      "LOCAL_LISTING_REDEMPTION",
      `Unlocked local listing: ${listing.title}`,
      { listingId: id, listingTitle: listing.title, category: listing.category }
    );

    // Activate the local listing
    const now = new Date();
    const expiresAt = new Date(now);
    expiresAt.setDate(expiresAt.getDate() + LOCAL_LISTING_PAID_DURATION_DAYS);

    await prisma.localListing.update({
      where: { id },
      data: {
        status: "ACTIVE",
        activatedAt: now,
        expiresAt: expiresAt,
      },
    });

    // Create a feed event for the newly activated listing
    await prisma.feedEvent.create({
      data: {
        type: "LISTING_CREATED",
        userId: session.user.id,
        localListingId: id,
        title: listing.title,
        description: listing.description.slice(0, 200),
      },
    });

    return NextResponse.json({
      success: true,
      message: "Local listing activated successfully with tokens",
      tokensSpent: LOCAL_LISTING_REDEMPTION_COST,
      newBalance: balance,
      transactionId,
      listing: {
        id: listing.id,
        status: "ACTIVE",
        activatedAt: now,
        expiresAt: expiresAt,
      },
    });
  } catch (error) {
    console.error("Error redeeming tokens for local listing:", error);

    if (error instanceof Error && error.message === "Insufficient token balance") {
      return NextResponse.json(
        { error: "Insufficient tokens" },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Failed to redeem tokens" },
      { status: 500 }
    );
  }
}

/**
 * GET /api/local-listings/[id]/redeem
 * Check if user can redeem tokens for this local listing
 */
export async function GET(request: Request, { params }: RouteParams) {
  try {
    const session = await auth();
    const { id } = await params;

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "You must be signed in" },
        { status: 401 }
      );
    }

    // Verify the local listing exists and belongs to the user
    const listing = await prisma.localListing.findUnique({
      where: { id },
    });

    if (!listing) {
      return NextResponse.json(
        { error: "Local listing not found" },
        { status: 404 }
      );
    }

    if (listing.userId !== session.user.id) {
      return NextResponse.json(
        { error: "You can only check your own listings" },
        { status: 403 }
      );
    }

    // Only SERVICES category requires payment
    if (listing.category !== "SERVICES") {
      return NextResponse.json({
        canRedeem: false,
        reason: "Only SERVICES category listings require payment",
        cost: 0,
        balance: await getBalance(session.user.id),
        listingStatus: listing.status,
      });
    }

    const balance = await getBalance(session.user.id);
    const canRedeem = balance >= LOCAL_LISTING_REDEMPTION_COST &&
                      ["DRAFT", "EXPIRED", "PENDING_PAYMENT"].includes(listing.status);

    return NextResponse.json({
      canRedeem,
      cost: LOCAL_LISTING_REDEMPTION_COST,
      balance,
      listingStatus: listing.status,
    });
  } catch (error) {
    console.error("Error checking redemption eligibility:", error);
    return NextResponse.json(
      { error: "Failed to check eligibility" },
      { status: 500 }
    );
  }
}
