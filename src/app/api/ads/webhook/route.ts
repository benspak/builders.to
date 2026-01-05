import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { prisma } from "@/lib/prisma";
import { getStripe, SIDEBAR_AD_DURATION_DAYS } from "@/lib/stripe";
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

  // Handle the checkout.session.completed event for ads
  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;

    // Only process sidebar_ad payments
    if (session.metadata?.type !== "sidebar_ad") {
      return NextResponse.json({ received: true });
    }

    const adId = session.metadata.adId;

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

      console.log(`Ad ${adId} activated successfully`);
    } catch (error) {
      console.error("Error activating ad:", error);
      return NextResponse.json(
        { error: "Failed to activate ad" },
        { status: 500 }
      );
    }
  }

  return NextResponse.json({ received: true });
}
