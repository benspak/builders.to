import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { prisma } from "@/lib/prisma";
import { getStripe, ROAST_MVP_FEATURE_DURATION_DAYS } from "@/lib/stripe";
import { addDays } from "date-fns";
import Stripe from "stripe";

export async function POST(request: Request) {
  console.log("[Roast MVP Webhook] Received webhook request");

  const body = await request.text();
  const headersList = await headers();
  const signature = headersList.get("stripe-signature");

  if (!signature) {
    console.error("[Roast MVP Webhook] No signature provided");
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
    console.log("[Roast MVP Webhook] Event verified:", event.type);
  } catch (err) {
    console.error("[Roast MVP Webhook] Signature verification failed:", err);
    return NextResponse.json(
      { error: "Invalid signature" },
      { status: 400 }
    );
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    console.log("[Roast MVP Webhook] Processing checkout session:", session.id);

    // Only handle roast_mvp payments
    if (session.metadata?.type !== "roast_mvp") {
      console.log("[Roast MVP Webhook] Not a roast_mvp payment, skipping");
      return NextResponse.json({ received: true });
    }

    const projectId = session.metadata.projectId;
    const userId = session.metadata.userId;

    if (!projectId || !userId) {
      console.error("[Roast MVP Webhook] Missing metadata in session:", session.id);
      return NextResponse.json(
        { error: "Missing metadata" },
        { status: 400 }
      );
    }

    console.log("[Roast MVP Webhook] Processing payment for project:", projectId, "user:", userId);

    try {
      // First, check if the RoastMVP entry exists
      let roastEntry = await prisma.roastMVP.findUnique({
        where: { stripeSessionId: session.id },
      });

      // If entry doesn't exist (e.g., was deleted or never created), create it
      if (!roastEntry) {
        console.log("[Roast MVP Webhook] Entry not found, creating new one");
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

      // Get the current max queue position
      const maxQueuePosition = await prisma.roastMVP.aggregate({
        _max: { queuePosition: true },
        where: {
          status: { in: ["PAID", "FEATURED"] },
        },
      });

      const nextPosition = (maxQueuePosition._max.queuePosition || 0) + 1;

      // Check if there's currently a featured project
      const currentFeatured = await prisma.roastMVP.findFirst({
        where: {
          status: "FEATURED",
          expiresAt: { gt: new Date() },
        },
      });

      // If no currently featured project, feature this one immediately
      if (!currentFeatured) {
        console.log("[Roast MVP Webhook] No featured project, featuring immediately");
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

        console.log(`[Roast MVP Webhook] Project ${projectId} is now FEATURED until ${expiresAt.toISOString()}`);
      } else {
        // Otherwise, add to queue as PAID
        await prisma.roastMVP.update({
          where: { id: roastEntry.id },
          data: {
            status: "PAID",
            stripePaymentId: session.payment_intent as string,
            queuePosition: nextPosition,
          },
        });

        console.log(`[Roast MVP Webhook] Project ${projectId} added to queue at position ${nextPosition}`);
      }
    } catch (error) {
      console.error("[Roast MVP Webhook] Error updating RoastMVP:", error);
      return NextResponse.json(
        { error: "Failed to update payment status" },
        { status: 500 }
      );
    }
  }

  console.log("[Roast MVP Webhook] Webhook processed successfully");
  return NextResponse.json({ received: true });
}
