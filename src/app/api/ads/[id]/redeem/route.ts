import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import {
  spendTokens,
  hasEnoughTokens,
  AD_REDEMPTION_COST,
  getBalance
} from "@/lib/tokens";
import { SIDEBAR_AD_DURATION_DAYS } from "@/lib/stripe";

interface RouteParams {
  params: Promise<{ id: string }>;
}

/**
 * POST /api/ads/[id]/redeem
 * Redeem tokens to activate an advertisement (instead of paying with Stripe)
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

    // Verify the ad exists and belongs to the user
    const ad = await prisma.advertisement.findUnique({
      where: { id },
    });

    if (!ad) {
      return NextResponse.json(
        { error: "Ad not found" },
        { status: 404 }
      );
    }

    if (ad.userId !== session.user.id) {
      return NextResponse.json(
        { error: "You can only redeem tokens for your own ads" },
        { status: 403 }
      );
    }

    // Check if ad is in a state that allows activation
    if (ad.status === "ACTIVE") {
      return NextResponse.json(
        { error: "This ad is already active" },
        { status: 400 }
      );
    }

    if (ad.status === "EXPIRED") {
      return NextResponse.json(
        { error: "This ad has expired. Please create a new ad." },
        { status: 400 }
      );
    }

    // Check if user has enough tokens
    const hasTokens = await hasEnoughTokens(session.user.id, AD_REDEMPTION_COST);
    if (!hasTokens) {
      const balance = await getBalance(session.user.id);
      return NextResponse.json(
        {
          error: "Insufficient tokens",
          required: AD_REDEMPTION_COST,
          balance,
        },
        { status: 400 }
      );
    }

    // Spend the tokens
    const { balance, transactionId } = await spendTokens(
      session.user.id,
      AD_REDEMPTION_COST,
      "AD_REDEMPTION",
      `Unlocked advertisement: ${ad.title}`,
      { adId: id, adTitle: ad.title }
    );

    // Activate the ad
    const startDate = new Date();
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + SIDEBAR_AD_DURATION_DAYS);

    await prisma.advertisement.update({
      where: { id },
      data: {
        status: "ACTIVE",
        amountPaid: 0, // Paid with tokens
        startDate,
        endDate,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Ad activated successfully with tokens",
      tokensSpent: AD_REDEMPTION_COST,
      newBalance: balance,
      transactionId,
      ad: {
        id: ad.id,
        status: "ACTIVE",
        startDate,
        endDate,
      },
    });
  } catch (error) {
    console.error("Error redeeming tokens for ad:", error);

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
 * GET /api/ads/[id]/redeem
 * Check if user can redeem tokens for this ad
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

    // Verify the ad exists and belongs to the user
    const ad = await prisma.advertisement.findUnique({
      where: { id },
    });

    if (!ad) {
      return NextResponse.json(
        { error: "Ad not found" },
        { status: 404 }
      );
    }

    if (ad.userId !== session.user.id) {
      return NextResponse.json(
        { error: "You can only check your own ads" },
        { status: 403 }
      );
    }

    const balance = await getBalance(session.user.id);
    const canRedeem = balance >= AD_REDEMPTION_COST &&
                      ad.status !== "ACTIVE" &&
                      ad.status !== "EXPIRED";

    return NextResponse.json({
      canRedeem,
      cost: AD_REDEMPTION_COST,
      balance,
      adStatus: ad.status,
    });
  } catch (error) {
    console.error("Error checking redemption eligibility:", error);
    return NextResponse.json(
      { error: "Failed to check eligibility" },
      { status: 500 }
    );
  }
}
