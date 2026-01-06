import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { prisma } from "@/lib/prisma";
import { getStripe, SIDEBAR_AD_DURATION_DAYS, SERVICE_LISTING_DURATION_DAYS } from "@/lib/stripe";
import Stripe from "stripe";

// POST /api/ads/webhook - Handle Stripe webhook events for ads
export async function POST(request: Request) {
  const body = await request.text();
  const headersList = await headers();
  const signature = headersList.get("stripe-signature");

  if (!signature) {
    return NextResponse.json(
      { error: "Missing stripe-signature header" },
      { status: 400 }
    );
  }

  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!webhookSecret) {
    console.error("STRIPE_WEBHOOK_SECRET is not set");
    return NextResponse.json(
      { error: "Webhook secret not configured" },
      { status: 500 }
    );
  }

  let event: Stripe.Event;

  try {
    const stripe = getStripe();
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (err) {
    console.error("Webhook signature verification failed:", err);
    return NextResponse.json(
      { error: "Invalid signature" },
      { status: 400 }
    );
  }

  // Handle the checkout.session.completed event
  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    const paymentType = session.metadata?.type;

    // Handle sidebar_ad payments
    if (paymentType === "sidebar_ad") {
      const adId = session.metadata?.adId;

      if (!adId) {
        console.error("No adId in session metadata");
        return NextResponse.json(
          { error: "Missing adId in metadata" },
          { status: 400 }
        );
      }

      try {
        const startDate = new Date();
        const endDate = new Date();
        endDate.setDate(endDate.getDate() + SIDEBAR_AD_DURATION_DAYS);

        await prisma.advertisement.update({
          where: { id: adId },
          data: {
            status: "ACTIVE",
            stripePaymentId: session.payment_intent as string,
            amountPaid: session.amount_total || 5000,
            startDate,
            endDate,
          },
        });

        console.log(`[Webhook] Ad ${adId} activated successfully`);
      } catch (error) {
        console.error("Error activating ad:", error);
        return NextResponse.json(
          { error: "Failed to activate ad" },
          { status: 500 }
        );
      }
    }

    // Handle service_listing payments (listing fee)
    if (paymentType === "service_listing") {
      const serviceId = session.metadata?.serviceId;

      if (!serviceId) {
        console.error("No serviceId in session metadata");
        return NextResponse.json(
          { error: "Missing serviceId in metadata" },
          { status: 400 }
        );
      }

      try {
        const now = new Date();
        const expiresAt = new Date(now);
        expiresAt.setDate(expiresAt.getDate() + SERVICE_LISTING_DURATION_DAYS);

        await prisma.serviceListing.update({
          where: { id: serviceId },
          data: {
            status: "ACTIVE",
            activatedAt: now,
            expiresAt: expiresAt,
          },
        });

        console.log(`[Webhook] Service listing ${serviceId} activated successfully`);
      } catch (error) {
        console.error("Error activating service listing:", error);
        return NextResponse.json(
          { error: "Failed to activate service listing" },
          { status: 500 }
        );
      }
    }

    // Handle service_purchase payments (when someone buys a service)
    if (paymentType === "service_purchase") {
      const orderId = session.metadata?.orderId;

      if (!orderId) {
        console.error("No orderId in session metadata");
        return NextResponse.json(
          { error: "Missing orderId in metadata" },
          { status: 400 }
        );
      }

      try {
        await prisma.serviceOrder.update({
          where: { id: orderId },
          data: {
            status: "PENDING_ACCEPTANCE",
            stripeSessionId: session.id,
            stripePaymentIntent: session.payment_intent as string,
          },
        });

        console.log(`[Webhook] Service order ${orderId} payment received`);
      } catch (error) {
        console.error("Error updating service order:", error);
        return NextResponse.json(
          { error: "Failed to update service order" },
          { status: 500 }
        );
      }
    }
  }

  return NextResponse.json({ received: true });
}
