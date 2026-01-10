import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getStripe, LOCAL_LISTING_FEE_CENTS } from "@/lib/stripe";

interface RouteParams {
  params: Promise<{ id: string }>;
}

/**
 * POST /api/local-listings/[id]/checkout
 * Create a Stripe checkout session for paid Services listings
 */
export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "You must be signed in" },
        { status: 401 }
      );
    }

    const { id: listingId } = await params;

    // Find the listing
    const listing = await prisma.localListing.findUnique({
      where: { id: listingId },
    });

    if (!listing) {
      return NextResponse.json(
        { error: "Listing not found" },
        { status: 404 }
      );
    }

    // Check ownership
    if (listing.userId !== session.user.id) {
      return NextResponse.json(
        { error: "You don't have permission to checkout this listing" },
        { status: 403 }
      );
    }

    // Only Services category requires payment
    if (listing.category !== "SERVICES") {
      return NextResponse.json(
        { error: "This listing category does not require payment" },
        { status: 400 }
      );
    }

    // Check if already paid/active
    if (listing.status === "ACTIVE") {
      return NextResponse.json(
        { error: "This listing is already active" },
        { status: 400 }
      );
    }

    // If there's already a checkout session, check if it's expired
    if (listing.stripeSessionId) {
      const stripe = getStripe();
      try {
        const existingSession = await stripe.checkout.sessions.retrieve(listing.stripeSessionId);
        if (existingSession.status === "open") {
          // Return the existing session URL
          return NextResponse.json({ url: existingSession.url });
        }
      } catch {
        // Session expired or doesn't exist, create a new one
      }
    }

    // Get the base URL
    const baseUrl = process.env.NEXTAUTH_URL || "http://localhost:3000";

    // Create Stripe checkout session
    const stripe = getStripe();
    const checkoutSession = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: "Local Services Listing",
              description: `90-day listing: ${listing.title}`,
            },
            unit_amount: LOCAL_LISTING_FEE_CENTS,
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: `${baseUrl}/local?checkout=success&listing=${listingId}`,
      cancel_url: `${baseUrl}/local?checkout=cancelled&listing=${listingId}`,
      metadata: {
        listingId,
        userId: session.user.id,
        type: "local_listing",
      },
    });

    // Update listing with checkout session ID
    await prisma.localListing.update({
      where: { id: listingId },
      data: {
        stripeSessionId: checkoutSession.id,
        status: "PENDING_PAYMENT",
      },
    });

    return NextResponse.json({ url: checkoutSession.url });
  } catch (error) {
    console.error("Error creating checkout session:", error);
    return NextResponse.json(
      { error: "Failed to create checkout session" },
      { status: 500 }
    );
  }
}
