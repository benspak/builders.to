import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getStripe, SERVICE_LISTING_FEE_CENTS, SERVICE_LISTING_DURATION_DAYS } from "@/lib/stripe";

interface RouteParams {
  params: Promise<{ id: string }>;
}

/**
 * POST /api/services/[id]/checkout
 * Create a Stripe checkout session for the listing fee
 */
export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await auth();
    const { id } = await params;

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "You must be signed in" },
        { status: 401 }
      );
    }

    // Get the service listing
    const service = await prisma.serviceListing.findUnique({
      where: { id },
    });

    if (!service) {
      return NextResponse.json(
        { error: "Service not found" },
        { status: 404 }
      );
    }

    if (service.userId !== session.user.id) {
      return NextResponse.json(
        { error: "You can only pay for your own listings" },
        { status: 403 }
      );
    }

    // Only allow checkout for DRAFT or EXPIRED listings
    if (!["DRAFT", "EXPIRED"].includes(service.status)) {
      return NextResponse.json(
        { error: `Cannot checkout for ${service.status} listing` },
        { status: 400 }
      );
    }

    // Create Stripe checkout session
    const baseUrl = process.env.NEXTAUTH_URL || "http://localhost:3000";
    const stripe = getStripe();

    const checkoutSession = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: "Service Listing - 90 Days",
              description: `Activate "${service.title}" for ${SERVICE_LISTING_DURATION_DAYS} days on the Builders.to marketplace`,
            },
            unit_amount: SERVICE_LISTING_FEE_CENTS,
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: `${baseUrl}/services/seller?listing=activated&serviceId=${service.id}`,
      cancel_url: `${baseUrl}/services/${service.id}/checkout?cancelled=true`,
      metadata: {
        type: "service_listing",
        serviceId: service.id,
        userId: session.user.id,
      },
      customer_email: session.user.email || undefined,
    });

    // Update service with pending status and session ID
    await prisma.serviceListing.update({
      where: { id },
      data: {
        status: "PENDING_PAYMENT",
        stripeSessionId: checkoutSession.id,
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
