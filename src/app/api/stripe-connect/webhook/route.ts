import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyWebhookSignature } from "@/lib/stripe-connect";
import { SERVICE_LISTING_DURATION_DAYS } from "@/lib/stripe";
import { RewardStatus } from "@prisma/client";
import type Stripe from "stripe";

// Ensure webhook is always dynamic and uses Node.js runtime
export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/**
 * POST /api/stripe-connect/webhook
 * Handle Stripe Connect webhooks
 */
export async function POST(request: Request) {
  console.log("[Stripe Connect Webhook] Received webhook request");

  const body = await request.text();
  const signature = request.headers.get("stripe-signature");

  if (!signature) {
    console.error("[Stripe Connect Webhook] No signature found");
    return NextResponse.json(
      { error: "No signature found" },
      { status: 400 }
    );
  }

  const webhookSecret = process.env.STRIPE_CONNECT_WEBHOOK_SECRET;
  if (!webhookSecret) {
    console.error("[Stripe Connect Webhook] Webhook secret not configured");
    return NextResponse.json(
      { error: "Webhook secret not configured" },
      { status: 500 }
    );
  }

  let event: Stripe.Event;

  try {
    event = verifyWebhookSignature(body, signature, webhookSecret);
  } catch (err) {
    console.error("[Stripe Connect Webhook] Signature verification failed:", err);
    return NextResponse.json(
      { error: "Invalid signature" },
      { status: 400 }
    );
  }

  console.log("[Stripe Connect Webhook] Event type:", event.type);

  try {
    switch (event.type) {
      case "account.updated": {
        // Handle Connect account updates
        const account = event.data.object as Stripe.Account;
        console.log("[Stripe Connect Webhook] Account updated:", account.id);

        // Check if the account is now fully onboarded
        if (account.charges_enabled && account.payouts_enabled) {
          // Find and update the user with this Connect account
          await prisma.user.updateMany({
            where: { stripeConnectId: account.id },
            data: { stripeConnectOnboarded: true },
          });
          console.log("[Stripe Connect Webhook] User onboarding complete for account:", account.id);
        }
        break;
      }

      case "checkout.session.completed": {
        // Handle listing fee payments
        const session = event.data.object as Stripe.Checkout.Session;

        if (session.metadata?.type === "service_listing") {
          const serviceId = session.metadata.serviceId;
          console.log("[Stripe Connect Webhook] Service listing paid:", serviceId);

          if (serviceId) {
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
            console.log("[Stripe Connect Webhook] Service listing activated:", serviceId);
          }
        }
        break;
      }

      case "payment_intent.succeeded": {
        // Handle service purchase payments
        const paymentIntent = event.data.object as Stripe.PaymentIntent;

        if (paymentIntent.metadata?.type === "service_purchase") {
          const orderId = paymentIntent.metadata.orderId;
          console.log("[Stripe Connect Webhook] Service order payment succeeded:", orderId);

          if (orderId) {
            await prisma.serviceOrder.update({
              where: { id: orderId },
              data: {
                status: "PENDING_ACCEPTANCE",
              },
            });
            console.log("[Stripe Connect Webhook] Service order updated:", orderId);
          }
        }
        break;
      }

      case "payment_intent.payment_failed": {
        // Handle failed payments
        const paymentIntent = event.data.object as Stripe.PaymentIntent;

        if (paymentIntent.metadata?.type === "service_purchase") {
          const orderId = paymentIntent.metadata.orderId;
          console.log("[Stripe Connect Webhook] Service order payment failed:", orderId);

          if (orderId) {
            await prisma.serviceOrder.update({
              where: { id: orderId },
              data: {
                status: "CANCELLED",
              },
            });
          }
        }
        break;
      }

      case "charge.refunded": {
        // Handle refunds
        const charge = event.data.object as Stripe.Charge;
        const paymentIntentId = charge.payment_intent as string;

        if (paymentIntentId) {
          const order = await prisma.serviceOrder.findUnique({
            where: { stripePaymentIntent: paymentIntentId },
          });

          if (order) {
            await prisma.serviceOrder.update({
              where: { id: order.id },
              data: { status: "REFUNDED" },
            });
            console.log("[Stripe Connect Webhook] Service order refunded:", order.id);
          }
        }
        break;
      }

      case "transfer.created": {
        // Handle creator payout transfer created
        const transfer = event.data.object as Stripe.Transfer;
        const payoutId = transfer.metadata?.payoutId;

        if (payoutId) {
          console.log("[Stripe Connect Webhook] Transfer created for payout:", payoutId);
          // Transfer is already marked as PROCESSING in our system
        }
        break;
      }

      case "transfer.reversed": {
        // Handle transfer reversal (e.g., payout failed)
        const transfer = event.data.object as Stripe.Transfer;
        const payoutId = transfer.metadata?.payoutId;
        const userId = transfer.metadata?.userId;

        if (payoutId) {
          console.log("[Stripe Connect Webhook] Transfer reversed for payout:", payoutId);

          // Get the payout to find the amount
          const payout = await prisma.payout.findUnique({
            where: { id: payoutId },
            include: { rewards: true },
          });

          if (payout) {
            // Mark payout as failed
            await prisma.payout.update({
              where: { id: payoutId },
              data: {
                status: RewardStatus.FAILED,
                failureReason: "Transfer was reversed",
              },
            });

            // Restore pending rewards
            await prisma.postReward.updateMany({
              where: {
                id: { in: payout.rewards.map((r) => r.id) },
              },
              data: {
                status: RewardStatus.PENDING,
                payoutId: null,
              },
            });

            // Restore pending amount in earnings
            if (userId) {
              await prisma.userEarnings.update({
                where: { userId },
                data: {
                  pendingAmount: { increment: payout.amount },
                },
              });
            }

            console.log("[Stripe Connect Webhook] Payout reversed and rewards restored:", payoutId);
          }
        }
        break;
      }

      case "transfer.failed": {
        // Handle failed transfer
        const transfer = event.data.object as Stripe.Transfer;
        const payoutId = transfer.metadata?.payoutId;
        const userId = transfer.metadata?.userId;

        if (payoutId) {
          console.log("[Stripe Connect Webhook] Transfer failed for payout:", payoutId);

          // Get the payout to find the amount
          const payout = await prisma.payout.findUnique({
            where: { id: payoutId },
            include: { rewards: true },
          });

          if (payout && payout.status !== RewardStatus.FAILED) {
            // Mark payout as failed
            await prisma.payout.update({
              where: { id: payoutId },
              data: {
                status: RewardStatus.FAILED,
                failureReason: "Stripe transfer failed",
              },
            });

            // Restore pending rewards
            await prisma.postReward.updateMany({
              where: {
                id: { in: payout.rewards.map((r) => r.id) },
              },
              data: {
                status: RewardStatus.PENDING,
                payoutId: null,
              },
            });

            // Restore pending amount in earnings
            if (userId) {
              await prisma.userEarnings.update({
                where: { userId },
                data: {
                  pendingAmount: { increment: payout.amount },
                },
              });
            }

            console.log("[Stripe Connect Webhook] Payout failed and rewards restored:", payoutId);
          }
        }
        break;
      }

      default:
        console.log("[Stripe Connect Webhook] Unhandled event type:", event.type);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("[Stripe Connect Webhook] Error processing webhook:", error);
    return NextResponse.json(
      { error: "Webhook processing failed" },
      { status: 500 }
    );
  }
}
