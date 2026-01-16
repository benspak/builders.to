import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getStripe, SERVICE_PLATFORM_FEE_PERCENT } from "@/lib/stripe";

interface RouteParams {
  params: Promise<{ id: string }>;
}

/**
 * POST /api/local-listings/[id]/purchase
 * Create a Stripe checkout session for purchasing a for-sale item
 */
export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await auth();
    const { id } = await params;

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "You must be signed in to purchase an item" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { notes } = body;

    // Get the listing with seller info
    const listing = await prisma.localListing.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            stripeConnectId: true,
            stripeConnectOnboarded: true,
          },
        },
      },
    });

    if (!listing) {
      return NextResponse.json(
        { error: "Listing not found" },
        { status: 404 }
      );
    }

    // Only FOR_SALE items can be purchased
    if (listing.category !== "FOR_SALE") {
      return NextResponse.json(
        { error: "This listing is not for sale" },
        { status: 400 }
      );
    }

    // Cannot purchase your own item
    if (listing.userId === session.user.id) {
      return NextResponse.json(
        { error: "You cannot purchase your own item" },
        { status: 400 }
      );
    }

    // Check if listing is active and not expired
    if (listing.status !== "ACTIVE") {
      return NextResponse.json(
        { error: "This item is not available for purchase" },
        { status: 400 }
      );
    }

    if (listing.expiresAt && new Date(listing.expiresAt) < new Date()) {
      return NextResponse.json(
        { error: "This listing has expired" },
        { status: 400 }
      );
    }

    // Verify item has a price
    if (!listing.priceInCents || listing.priceInCents <= 0) {
      return NextResponse.json(
        { error: "This item does not have a valid price" },
        { status: 400 }
      );
    }

    // Verify seller has Stripe Connect set up
    if (!listing.user.stripeConnectId || !listing.user.stripeConnectOnboarded) {
      return NextResponse.json(
        { error: "Seller is not set up to receive payments" },
        { status: 400 }
      );
    }

    // Calculate platform fee (5%)
    const platformFeeInCents = Math.round(
      (listing.priceInCents * SERVICE_PLATFORM_FEE_PERCENT) / 100
    );

    // Create the order record first
    const order = await prisma.localListingOrder.create({
      data: {
        listingId: listing.id,
        buyerId: session.user.id,
        notes: notes || null,
        priceInCents: listing.priceInCents,
        platformFeeInCents,
        status: "PENDING_PAYMENT",
      },
    });

    // Create Stripe checkout session with Connect
    const baseUrl = process.env.NEXTAUTH_URL || "http://localhost:3000";
    const stripe = getStripe();

    const checkoutSession = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: listing.title,
              description: `For sale item from ${listing.city}, ${listing.state}`,
            },
            unit_amount: listing.priceInCents,
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: `${baseUrl}/purchases?success=true&orderId=${order.id}&type=listing`,
      cancel_url: `${baseUrl}/listing/${listing.slug}?cancelled=true`,
      metadata: {
        type: "local_listing_purchase",
        listingId: listing.id,
        orderId: order.id,
        buyerId: session.user.id,
        sellerId: listing.userId,
      },
      customer_email: session.user.email || undefined,
      // Destination charge with application fee
      payment_intent_data: {
        application_fee_amount: platformFeeInCents,
        transfer_data: {
          destination: listing.user.stripeConnectId,
        },
        metadata: {
          type: "local_listing_purchase",
          listingId: listing.id,
          orderId: order.id,
        },
      },
    });

    // Update order with Stripe session info
    await prisma.localListingOrder.update({
      where: { id: order.id },
      data: {
        stripePaymentIntent: checkoutSession.payment_intent as string || null,
      },
    });

    return NextResponse.json({
      url: checkoutSession.url,
      sessionId: checkoutSession.id,
      orderId: order.id,
    });
  } catch (error) {
    console.error("Error creating purchase checkout session:", error);
    return NextResponse.json(
      { error: "Failed to create checkout session" },
      { status: 500 }
    );
  }
}
