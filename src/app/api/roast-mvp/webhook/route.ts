import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { prisma } from "@/lib/prisma";
import { getStripe } from "@/lib/stripe";
import Stripe from "stripe";

export async function POST(request: Request) {
  const body = await request.text();
  const headersList = await headers();
  const signature = headersList.get("stripe-signature");

  if (!signature) {
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
  } catch (err) {
    console.error("Webhook signature verification failed:", err);
    return NextResponse.json(
      { error: "Invalid signature" },
      { status: 400 }
    );
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;

    // Only handle roast_mvp payments
    if (session.metadata?.type !== "roast_mvp") {
      return NextResponse.json({ received: true });
    }

    const projectId = session.metadata.projectId;
    const userId = session.metadata.userId;

    if (!projectId || !userId) {
      console.error("Missing metadata in Stripe session:", session.id);
      return NextResponse.json(
        { error: "Missing metadata" },
        { status: 400 }
      );
    }

    try {
      // Get the current max queue position
      const maxQueuePosition = await prisma.roastMVP.aggregate({
        _max: { queuePosition: true },
        where: {
          status: { in: ["PAID", "FEATURED"] },
        },
      });

      const nextPosition = (maxQueuePosition._max.queuePosition || 0) + 1;

      // Update the RoastMVP entry
      await prisma.roastMVP.update({
        where: { stripeSessionId: session.id },
        data: {
          status: "PAID",
          stripePaymentId: session.payment_intent as string,
          queuePosition: nextPosition,
        },
      });

      console.log(`Roast MVP payment completed for project ${projectId}, queue position: ${nextPosition}`);
    } catch (error) {
      console.error("Error updating RoastMVP:", error);
      return NextResponse.json(
        { error: "Failed to update payment status" },
        { status: 500 }
      );
    }
  }

  return NextResponse.json({ received: true });
}
