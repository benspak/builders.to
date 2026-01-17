import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getStripe, SIDEBAR_AD_PRICE_CENTS, SIDEBAR_AD_DURATION_DAYS, MAX_ACTIVE_ADS, AD_SURCHARGE_CENTS } from "@/lib/stripe";

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

    // If there's an existing pending payment session, we'll create a new one
    if (ad.status === "PENDING_PAYMENT" && ad.stripeSessionId) {
      // Clear the old session reference
      await prisma.advertisement.update({
        where: { id },
        data: { stripeSessionId: null },
      });
    }

    // Count user's current active ads to determine if surcharge applies
    const activeAdsCount = await prisma.advertisement.count({
      where: {
        userId: session.user.id,
        status: "ACTIVE",
      },
    });

    const isOverLimit = activeAdsCount >= MAX_ACTIVE_ADS;
    const totalPrice = isOverLimit
      ? SIDEBAR_AD_PRICE_CENTS + AD_SURCHARGE_CENTS
      : SIDEBAR_AD_PRICE_CENTS;

    // Create Stripe Checkout Session
    const baseUrl = process.env.NEXTAUTH_URL || "http://localhost:3000";
    const stripe = getStripe();

    const productName = isOverLimit
      ? "Sidebar Advertisement - 1 Month (includes surcharge)"
      : "Sidebar Advertisement - 1 Month";
    const productDescription = isOverLimit
      ? `Your ad "${ad.title}" will be displayed on the Builders.to feed for ${SIDEBAR_AD_DURATION_DAYS} days. Includes $5 surcharge for exceeding ${MAX_ACTIVE_ADS} active ads.`
      : `Your ad "${ad.title}" will be displayed on the Builders.to feed for ${SIDEBAR_AD_DURATION_DAYS} days`;

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
            unit_amount: totalPrice,
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
    });
  } catch (error) {
    console.error("Error creating checkout session:", error);
    return NextResponse.json(
      { error: "Failed to create checkout session" },
      { status: 500 }
    );
  }
}
