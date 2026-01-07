import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { prisma } from "@/lib/prisma";
import { getStripe, ROAST_MVP_FEATURE_DURATION_DAYS, SIDEBAR_AD_DURATION_DAYS, SERVICE_LISTING_DURATION_DAYS } from "@/lib/stripe";
import { addDays } from "date-fns";
import Stripe from "stripe";

export async function POST(request: Request) {
  console.log("[Webhook] Received webhook request");

  const body = await request.text();
  const headersList = await headers();
  const signature = headersList.get("stripe-signature");

  if (!signature) {
    console.error("[Webhook] No signature provided");
    return NextResponse.json(
      { error: "No signature provided" },
      { status: 400 }
    );
  }

  let event: Stripe.Event;
  const stripe = getStripe();

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
    console.log("[Webhook] Event verified:", event.type);
  } catch (err) {
    console.error("[Webhook] Signature verification failed:", err);
    return NextResponse.json(
      { error: "Invalid signature" },
      { status: 400 }
    );
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    const paymentType = session.metadata?.type;
    console.log("[Webhook] Processing checkout session:", session.id, "type:", paymentType);

    // Handle roast_mvp payments
    if (paymentType === "roast_mvp") {
      const projectId = session.metadata?.projectId;
      const userId = session.metadata?.userId;

      if (!projectId || !userId) {
        console.error("[Webhook] Missing metadata in roast_mvp session:", session.id);
        return NextResponse.json(
          { error: "Missing metadata" },
          { status: 400 }
        );
      }

      console.log("[Webhook] Processing roast_mvp for project:", projectId);

      try {
        let roastEntry = await prisma.roastMVP.findUnique({
          where: { stripeSessionId: session.id },
        });

        if (!roastEntry) {
          console.log("[Webhook] RoastMVP entry not found, creating new one");
          roastEntry = await prisma.roastMVP.create({
            data: {
              projectId,
              userId,
              stripeSessionId: session.id,
              stripePaymentId: session.payment_intent as string,
              status: "PENDING_PAYMENT",
            },
          });
        }

        const maxQueuePosition = await prisma.roastMVP.aggregate({
          _max: { queuePosition: true },
          where: { status: { in: ["PAID", "FEATURED"] } },
        });

        const nextPosition = (maxQueuePosition._max.queuePosition || 0) + 1;

        const currentFeatured = await prisma.roastMVP.findFirst({
          where: {
            status: "FEATURED",
            expiresAt: { gt: new Date() },
          },
        });

        if (!currentFeatured) {
          console.log("[Webhook] No featured project, featuring immediately");
          const now = new Date();
          const expiresAt = addDays(now, ROAST_MVP_FEATURE_DURATION_DAYS);

          await prisma.roastMVP.update({
            where: { id: roastEntry.id },
            data: {
              status: "FEATURED",
              stripePaymentId: session.payment_intent as string,
              queuePosition: nextPosition,
              featuredAt: now,
              expiresAt,
            },
          });

          console.log(`[Webhook] Project ${projectId} is now FEATURED until ${expiresAt.toISOString()}`);
        } else {
          await prisma.roastMVP.update({
            where: { id: roastEntry.id },
            data: {
              status: "PAID",
              stripePaymentId: session.payment_intent as string,
              queuePosition: nextPosition,
            },
          });

          console.log(`[Webhook] Project ${projectId} added to queue at position ${nextPosition}`);
        }
      } catch (error) {
        console.error("[Webhook] Error updating RoastMVP:", error);
        return NextResponse.json(
          { error: "Failed to update payment status" },
          { status: 500 }
        );
      }
    }

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
        const startDate = new Date();
        const endDate = addDays(startDate, SIDEBAR_AD_DURATION_DAYS);

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
        const now = new Date();
        const expiresAt = addDays(now, SERVICE_LISTING_DURATION_DAYS);

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
        console.error("[Webhook] Error updating service order:", error);
        return NextResponse.json(
          { error: "Failed to update service order" },
          { status: 500 }
        );
      }
    }
  }

  console.log("[Webhook] Webhook processed successfully");
  return NextResponse.json({ received: true });
}
