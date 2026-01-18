import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getStripe, SIDEBAR_AD_DURATION_DAYS, PLATFORM_AD_SLOTS, getCurrentAdPriceCents, formatAdPrice } from "@/lib/stripe";

interface RouteParams {
  params: Promise<{ id: string }>;
}

// POST /api/ads/[id]/checkout - Create Stripe checkout session for an ad
export async function POST(request: Request, { params }: RouteParams) {
  try {
    const session = await auth();
    const { id } = await params;

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "You must be signed in to purchase an ad" },
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
        { error: "You can only purchase your own ads" },
        { status: 403 }
      );
    }

    // Check if ad is in a state that allows purchasing
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

    // Check platform-wide slot availability
    const now = new Date();
    const activeAdsCount = await prisma.advertisement.count({
      where: {
        status: "ACTIVE",
        startDate: { lte: now },
        endDate: { gt: now },
      },
    });

    const availableSlots = PLATFORM_AD_SLOTS - activeAdsCount;
    if (availableSlots <= 0) {
      return NextResponse.json(
        {
          error: "All ad slots are currently filled. Please try again when a slot becomes available.",
          isSoldOut: true,
        },
        { status: 400 }
      );
    }

    // Get current pricing tier
    let pricingConfig = await prisma.adPricingConfig.findUnique({
      where: { id: "singleton" },
    });

    if (!pricingConfig) {
      pricingConfig = await prisma.adPricingConfig.create({
        data: { id: "singleton", currentTier: 0 },
      });
    }

    const currentPriceCents = getCurrentAdPriceCents(pricingConfig.currentTier);

    // If there's an existing pending payment session, we'll create a new one
    if (ad.status === "PENDING_PAYMENT" && ad.stripeSessionId) {
      // Clear the old session reference
      await prisma.advertisement.update({
        where: { id },
        data: { stripeSessionId: null },
      });
    }

    // Create Stripe Checkout Session
    const baseUrl = process.env.NEXTAUTH_URL || "http://localhost:3000";
    const stripe = getStripe();

    const productName = "Sidebar Advertisement - 1 Month";
    const productDescription = `Your ad "${ad.title}" will be displayed on the Builders.to feed for ${SIDEBAR_AD_DURATION_DAYS} days. ${availableSlots <= 2 ? `Only ${availableSlots} slot${availableSlots === 1 ? "" : "s"} remaining!` : ""}`;

    const checkoutSession = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: productName,
              description: productDescription,
            },
            unit_amount: currentPriceCents,
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: `${baseUrl}/ads?success=true&adId=${ad.id}`,
      cancel_url: `${baseUrl}/ads/${ad.id}?cancelled=true`,
      metadata: {
        adId: ad.id,
        userId: session.user.id,
        type: "sidebar_ad",
        pricingTier: pricingConfig.currentTier.toString(),
        priceCents: currentPriceCents.toString(),
      },
      customer_email: session.user.email || undefined,
    });

    // Update ad with pending status and session ID
    await prisma.advertisement.update({
      where: { id },
      data: {
        stripeSessionId: checkoutSession.id,
        status: "PENDING_PAYMENT",
      },
    });

    return NextResponse.json({
      url: checkoutSession.url,
      sessionId: checkoutSession.id,
      priceCents: currentPriceCents,
      priceFormatted: formatAdPrice(currentPriceCents),
      availableSlots,
    });
  } catch (error) {
    console.error("Error creating checkout session:", error);
    return NextResponse.json(
      { error: "Failed to create checkout session" },
      { status: 500 }
    );
  }
}
