import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getStripe } from "@/lib/stripe";
import { TOKEN_PURCHASE_PACKAGES } from "@/lib/tokens";

/**
 * POST /api/tokens/purchase
 * Create a Stripe checkout session to purchase tokens for yourself
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
    const tokenPackage = TOKEN_PURCHASE_PACKAGES.find(p => p.id === packageId);
    if (!tokenPackage) {
      return NextResponse.json(
        { error: "Invalid token package" },
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
              name: `${tokenPackage.tokens} Tokens - ${tokenPackage.label}`,
              description: tokenPackage.description,
            },
            unit_amount: tokenPackage.priceInCents,
          },
          quantity: 1,
        },
      ],
      metadata: {
        type: "token_purchase",
        userId: session.user.id,
        tokenAmount: tokenPackage.tokens.toString(),
        packageId: tokenPackage.id,
      },
      customer_email: user?.email || session.user.email || undefined,
      success_url: `${baseUrl}/tokens?purchase=success&tokens=${tokenPackage.tokens}`,
      cancel_url: `${baseUrl}/tokens?purchase=cancelled`,
    });

    return NextResponse.json({
      checkoutUrl: checkoutSession.url,
      sessionId: checkoutSession.id,
    });
  } catch (error) {
    console.error("Error creating token purchase checkout:", error);
    return NextResponse.json(
      { error: "Failed to create checkout session" },
      { status: 500 }
    );
  }
}
