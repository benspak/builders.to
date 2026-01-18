import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { PLATFORM_AD_SLOTS, getCurrentAdPriceCents, formatAdPrice } from "@/lib/stripe";

// GET /api/ads/pricing - Get current ad pricing and slot availability
export async function GET() {
  try {
    const now = new Date();

    // Get current active ads count
    const activeAdsCount = await prisma.advertisement.count({
      where: {
        status: "ACTIVE",
        startDate: { lte: now },
        endDate: { gt: now },
      },
    });

    // Get or create pricing config (singleton)
    let pricingConfig = await prisma.adPricingConfig.findUnique({
      where: { id: "singleton" },
    });

    // If no config exists, create it with default tier
    if (!pricingConfig) {
      pricingConfig = await prisma.adPricingConfig.create({
        data: {
          id: "singleton",
          currentTier: 0,
        },
      });
    }

    const currentPriceCents = getCurrentAdPriceCents(pricingConfig.currentTier);
    const nextTierPriceCents = getCurrentAdPriceCents(pricingConfig.currentTier + 1);
    const availableSlots = Math.max(0, PLATFORM_AD_SLOTS - activeAdsCount);
    const isSoldOut = availableSlots === 0;

    return NextResponse.json({
      currentPriceCents,
      currentPriceFormatted: formatAdPrice(currentPriceCents),
      nextTierPriceCents,
      nextTierPriceFormatted: formatAdPrice(nextTierPriceCents),
      availableSlots,
      totalSlots: PLATFORM_AD_SLOTS,
      activeAdsCount,
      pricingTier: pricingConfig.currentTier,
      isSoldOut,
      // Scarcity messaging
      scarcityMessage: isSoldOut
        ? "All ad slots are currently filled. Join the waitlist!"
        : availableSlots <= 2
          ? `Only ${availableSlots} slot${availableSlots === 1 ? "" : "s"} left at ${formatAdPrice(currentPriceCents)}/mo!`
          : null,
    });
  } catch (error) {
    console.error("Error fetching ad pricing:", error);
    return NextResponse.json(
      { error: "Failed to fetch ad pricing" },
      { status: 500 }
    );
  }
}
