import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import {
  PLATFORM_AD_SLOTS,
  SIDEBAR_AD_DURATION_DAYS,
} from "@/lib/stripe";
import { debit as debitTokens, getAdSlotCostTokens } from "@/lib/services/tokens.service";

interface RouteParams {
  params: Promise<{ id: string }>;
}

/**
 * POST /api/ads/[id]/activate-with-tokens - Activate an ad by spending tokens
 */
export async function POST(_request: Request, { params }: RouteParams) {
  try {
    const session = await auth();
    const { id: adId } = await params;

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "You must be signed in to activate an ad" },
        { status: 401 }
      );
    }

    const ad = await prisma.advertisement.findUnique({
      where: { id: adId },
    });

    if (!ad) {
      return NextResponse.json({ error: "Ad not found" }, { status: 404 });
    }

    if (ad.userId !== session.user.id) {
      return NextResponse.json(
        { error: "You can only activate your own ads" },
        { status: 403 }
      );
    }

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

    const now = new Date();
    const activeAdsCount = await prisma.advertisement.count({
      where: {
        status: "ACTIVE",
        startDate: { lte: now },
        endDate: { gt: now },
      },
    });

    if (PLATFORM_AD_SLOTS - activeAdsCount <= 0) {
      return NextResponse.json(
        {
          error: "All ad slots are currently filled. Please try again when a slot becomes available.",
          isSoldOut: true,
        },
        { status: 400 }
      );
    }

    let pricingConfig = await prisma.adPricingConfig.findUnique({
      where: { id: "singleton" },
    });
    if (!pricingConfig) {
      pricingConfig = await prisma.adPricingConfig.create({
        data: { id: "singleton", currentTier: 0 },
      });
    }

    const costTokens = getAdSlotCostTokens(pricingConfig.currentTier);

    try {
      await debitTokens({
        userId: session.user.id,
        amount: costTokens,
        type: "AD_REDEMPTION",
        description: `Sidebar ad: ${ad.title}`,
        metadata: { adId },
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : "Insufficient token balance";
      return NextResponse.json(
        { error: message, insufficientBalance: true },
        { status: 400 }
      );
    }

    const startDate = new Date();
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + SIDEBAR_AD_DURATION_DAYS);

    await prisma.advertisement.update({
      where: { id: adId },
      data: {
        status: "ACTIVE",
        startDate,
        endDate,
        stripeSessionId: null,
        stripePaymentId: null,
        amountPaid: 0,
      },
    });

    return NextResponse.json({
      success: true,
      adId,
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString(),
    });
  } catch (error) {
    console.error("Error activating ad with tokens:", error);
    return NextResponse.json(
      { error: "Failed to activate ad" },
      { status: 500 }
    );
  }
}
