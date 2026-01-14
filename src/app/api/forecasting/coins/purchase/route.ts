import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getStripe } from "@/lib/stripe";
import { COIN_PURCHASE_PACKAGES, COIN_PURCHASE_DISCLAIMER } from "@/lib/coins";

/**
 * POST /api/forecasting/coins/purchase
 * Create a Stripe checkout session to purchase coins
 */
export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "You must be signed in" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { packageId } = body;

    if (!packageId) {
      return NextResponse.json(
        { error: "Package is required" },
        { status: 400 }
      );
    }

    // Find the package
    const coinPackage = COIN_PURCHASE_PACKAGES.find(p => p.id === packageId);
    if (!coinPackage) {
      return NextResponse.json(
        { error: "Invalid coin package" },
        { status: 400 }
      );
    }

    // Get user info
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        name: true,
        displayName: true,
        firstName: true,
        lastName: true,
        email: true,
      },
    });

    // Create Stripe checkout session
    const stripe = getStripe();
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://builders.to";

    const checkoutSession = await stripe.checkout.sessions.create({
      mode: "payment",
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: `${coinPackage.coins.toLocaleString()} Forecasting Coins - ${coinPackage.label}`,
              description: `${coinPackage.description}. ${COIN_PURCHASE_DISCLAIMER}`,
            },
            unit_amount: coinPackage.priceInCents,
          },
          quantity: 1,
        },
      ],
      metadata: {
        type: "coin_purchase",
        userId: session.user.id,
        coinAmount: coinPackage.coins.toString(),
        packageId: coinPackage.id,
      },
      customer_email: user?.email || session.user.email || undefined,
      success_url: `${baseUrl}/forecasting?purchase=success&coins=${coinPackage.coins}`,
      cancel_url: `${baseUrl}/forecasting?purchase=cancelled`,
    });

    return NextResponse.json({
      checkoutUrl: checkoutSession.url,
      sessionId: checkoutSession.id,
    });
  } catch (error) {
    console.error("Error creating coin purchase checkout:", error);
    return NextResponse.json(
      { error: "Failed to create checkout session" },
      { status: 500 }
    );
  }
}

/**
 * GET /api/forecasting/coins/purchase
 * Get available coin packages
 */
export async function GET() {
  return NextResponse.json({
    packages: COIN_PURCHASE_PACKAGES,
    disclaimer: COIN_PURCHASE_DISCLAIMER,
  });
}
