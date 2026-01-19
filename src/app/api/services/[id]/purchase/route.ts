import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getStripe } from "@/lib/stripe";

interface RouteParams {
  params: Promise<{ id: string }>;
}

/**
 * POST /api/services/[id]/purchase
 * Create a Stripe checkout session for purchasing a service
 */
export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await auth();
    const { id } = await params;

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "You must be signed in to purchase a service" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { requirements } = body;

    // Get the service listing with seller info
    const service = await prisma.serviceListing.findUnique({
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

    if (!service) {
      return NextResponse.json(
        { error: "Service not found" },
        { status: 404 }
      );
    }

    // Cannot purchase your own service
    if (service.userId === session.user.id) {
      return NextResponse.json(
        { error: "You cannot purchase your own service" },
        { status: 400 }
      );
    }

    // Check if service is active and not expired
    if (service.status !== "ACTIVE") {
      return NextResponse.json(
        { error: "This service is not available for purchase" },
        { status: 400 }
      );
    }

    if (service.expiresAt && new Date(service.expiresAt) < new Date()) {
      return NextResponse.json(
        { error: "This service listing has expired" },
        { status: 400 }
      );
    }

    // Verify seller has Stripe Connect set up
    if (!service.user.stripeConnectId || !service.user.stripeConnectOnboarded) {
      return NextResponse.json(
        { error: "Seller is not set up to receive payments" },
        { status: 400 }
      );
    }

    // No platform fee - services are free
    // Create the order record first
    const order = await prisma.serviceOrder.create({
      data: {
        serviceId: service.id,
        buyerId: session.user.id,
        requirements: requirements || null,
        priceInCents: service.priceInCents,
        platformFeeInCents: null, // No platform fee
        status: "PENDING_ACCEPTANCE", // Will be updated after payment
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
              name: service.title,
              description: `Service from a verified builder with ${service.user.stripeConnectOnboarded ? "connected" : ""} payment account`,
            },
            unit_amount: service.priceInCents,
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: `${baseUrl}/purchases?success=true&orderId=${order.id}`,
      cancel_url: `${baseUrl}/services/${service.slug || service.id}?cancelled=true`,
      metadata: {
        type: "service_purchase",
        serviceId: service.id,
        orderId: order.id,
        buyerId: session.user.id,
        sellerId: service.userId,
      },
      customer_email: session.user.email || undefined,
      // Direct transfer to seller - no platform fee
      payment_intent_data: {
        transfer_data: {
          destination: service.user.stripeConnectId,
        },
        // Use manual capture for escrow-like behavior
        capture_method: "manual",
        metadata: {
          type: "service_purchase",
          serviceId: service.id,
          orderId: order.id,
        },
      },
    });

    // Update order with Stripe session info
    await prisma.serviceOrder.update({
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
