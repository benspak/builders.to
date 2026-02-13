import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getStripe, SIDEBAR_AD_DURATION_DAYS, SERVICE_LISTING_DURATION_DAYS, PLATFORM_AD_SLOTS } from "@/lib/stripe";
import Stripe from "stripe";

// Ensure webhook is always dynamic and uses Node.js runtime
export const dynamic = "force-dynamic";
export const runtime = "nodejs";

// POST /api/ads/webhook - Handle Stripe webhook events for ads
export async function POST(request: Request) {
  const body = await request.text();
  const signature = request.headers.get("stripe-signature");

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
        console.error("[Webhook] No adId in session metadata");
        return NextResponse.json(
          { error: "Missing adId in metadata" },
          { status: 400 }
        );
      }

      try {
        // Check if ad exists first
        const existingAd = await prisma.advertisement.findUnique({
          where: { id: adId },
        });

        if (!existingAd) {
          console.error(`[Webhook] Ad ${adId} not found`);
          return NextResponse.json({ received: true, warning: "Ad not found" });
        }

        // Only update if not already active (idempotency)
        if (existingAd.status === "ACTIVE") {
          console.log(`[Webhook] Ad ${adId} already active, skipping`);
          return NextResponse.json({ received: true });
        }

        const startDate = new Date();
        const endDate = new Date();
        endDate.setDate(endDate.getDate() + SIDEBAR_AD_DURATION_DAYS);

        await prisma.advertisement.update({
          where: { id: adId },
          data: {
            status: "ACTIVE",
            stripePaymentId: session.payment_intent as string,
            amountPaid: session.amount_total || 500,
            startDate,
            endDate,
          },
        });

        console.log(`[Webhook] Ad ${adId} activated successfully`);

        // Check if we need to increment the pricing tier
        // This happens when all ad slots are filled
        const now = new Date();
        const activeAdsCount = await prisma.advertisement.count({
          where: {
            status: "ACTIVE",
            startDate: { lte: now },
            endDate: { gt: now },
          },
        });

        // If all slots are now filled, increment the pricing tier for future ads
        if (activeAdsCount >= PLATFORM_AD_SLOTS) {
          const currentConfig = await prisma.adPricingConfig.findUnique({
            where: { id: "singleton" },
          });

          if (currentConfig) {
            await prisma.adPricingConfig.update({
              where: { id: "singleton" },
              data: {
                currentTier: currentConfig.currentTier + 1,
              },
            });
            console.log(`[Webhook] Ad slots filled (${activeAdsCount}/${PLATFORM_AD_SLOTS}). Pricing tier increased to ${currentConfig.currentTier + 1}`);
          }
        }
      } catch (error) {
        console.error("[Webhook] Error activating ad:", error);
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
        console.error("[Webhook] No serviceId in session metadata");
        return NextResponse.json(
          { error: "Missing serviceId in metadata" },
          { status: 400 }
        );
      }

      try {
        // Check if service listing exists first
        const existingService = await prisma.serviceListing.findUnique({
          where: { id: serviceId },
        });

        if (!existingService) {
          console.error(`[Webhook] Service listing ${serviceId} not found`);
          return NextResponse.json({ received: true, warning: "Service listing not found" });
        }

        // Only update if not already active (idempotency)
        if (existingService.status === "ACTIVE") {
          console.log(`[Webhook] Service listing ${serviceId} already active, skipping`);
          return NextResponse.json({ received: true });
        }

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
        console.error("[Webhook] Error activating service listing:", error);
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
        console.error("[Webhook] No orderId in session metadata");
        return NextResponse.json(
          { error: "Missing orderId in metadata" },
          { status: 400 }
        );
      }

      try {
        // Check if order exists first to avoid Prisma errors
        const existingOrder = await prisma.serviceOrder.findUnique({
          where: { id: orderId },
        });

        if (!existingOrder) {
          console.error(`[Webhook] Service order ${orderId} not found`);
          // Return 200 to prevent Stripe from retrying for a non-existent order
          return NextResponse.json({ received: true, warning: "Order not found" });
        }

        // Only update if not already processed (idempotency)
        if (existingOrder.status === "PENDING_ACCEPTANCE" && existingOrder.stripePaymentIntent) {
          console.log(`[Webhook] Service order ${orderId} already processed, skipping`);
          return NextResponse.json({ received: true });
        }

        await prisma.serviceOrder.update({
          where: { id: orderId },
          data: {
            status: "PENDING_ACCEPTANCE",
            stripePaymentIntent: session.payment_intent as string,
          },
        });

        console.log(`[Webhook] Service order ${orderId} payment received`);
      } catch (error) {
        console.error("[Webhook] Error updating service order:", error);
        return NextResponse.json(
          { error: "Failed to update service order" },
          { status: 500 }
        );
      }
    }

  }

  return NextResponse.json({ received: true });
}
