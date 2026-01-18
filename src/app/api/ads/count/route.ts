import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { PLATFORM_AD_SLOTS, getCurrentAdPriceCents, formatAdPrice } from "@/lib/stripe";

// GET /api/ads/count - Get current user's active ad count and platform availability
export async function GET() {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "You must be signed in to view your ad count" },
        { status: 401 }
      );
    }

    // Get user's active ad count
    const userActiveCount = await prisma.advertisement.count({
      where: {
        userId: session.user.id,
        status: "ACTIVE",
      },
    });

    // Get platform-wide active ads count
    const now = new Date();
    const platformActiveCount = await prisma.advertisement.count({
      where: {
        status: "ACTIVE",
        startDate: { lte: now },
        endDate: { gt: now },
      },
    });

    // Get pricing config
    let pricingConfig = await prisma.adPricingConfig.findUnique({
      where: { id: "singleton" },
    });

    if (!pricingConfig) {
      pricingConfig = await prisma.adPricingConfig.create({
        data: { id: "singleton", currentTier: 0 },
      });
    }

    const currentPriceCents = getCurrentAdPriceCents(pricingConfig.currentTier);
    const availableSlots = Math.max(0, PLATFORM_AD_SLOTS - platformActiveCount);

    return NextResponse.json({
      userActiveCount,
      platformActiveCount,
      availableSlots,
      totalSlots: PLATFORM_AD_SLOTS,
      isSoldOut: availableSlots === 0,
      currentPriceCents,
      currentPriceFormatted: formatAdPrice(currentPriceCents),
      pricingTier: pricingConfig.currentTier,
    });
  } catch (error) {
    console.error("Error fetching ad count:", error);
    return NextResponse.json(
      { error: "Failed to fetch ad count" },
      { status: 500 }
    );
  }
}
