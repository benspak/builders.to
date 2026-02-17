import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { createProCheckoutSession, verifyAndSyncProStatus } from "@/lib/stripe-subscription";

/**
 * POST /api/pro/subscribe
 * Create a Stripe Checkout session for Pro subscription
 */
export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "You must be signed in to subscribe" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { plan } = body;

    if (!plan || !["MONTHLY", "YEARLY"].includes(plan)) {
      return NextResponse.json(
        { error: "Invalid plan. Must be MONTHLY or YEARLY" },
        { status: 400 }
      );
    }

    // Get user email
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { email: true },
    });

    if (!user?.email) {
      return NextResponse.json(
        { error: "You must have an email address to subscribe" },
        { status: 400 }
      );
    }

    // Check if user already has an active subscription
    const existingSubscription = await prisma.proSubscription.findUnique({
      where: { userId: session.user.id },
      select: { status: true },
    });

    if (existingSubscription?.status === "ACTIVE") {
      return NextResponse.json(
        { error: "You already have an active Pro subscription" },
        { status: 400 }
      );
    }

    // Create checkout session
    const baseUrl = process.env.NEXTAUTH_URL || "http://localhost:3000";
    const returnUrl = `${baseUrl}/settings`;

    const { sessionId, url } = await createProCheckoutSession(
      session.user.id,
      user.email,
      plan,
      returnUrl
    );

    return NextResponse.json({ sessionId, url });
  } catch (error) {
    console.error("[Pro Subscribe] Error:", error);
    return NextResponse.json(
      { error: "Failed to create checkout session" },
      { status: 500 }
    );
  }
}

/**
 * GET /api/pro/subscribe
 * Get current subscription status
 */
export async function GET() {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "You must be signed in" },
        { status: 401 }
      );
    }

    // First, get the local subscription record
    let subscription = await prisma.proSubscription.findUnique({
      where: { userId: session.user.id },
      select: {
        status: true,
        plan: true,
        currentPeriodEnd: true,
        cancelAtPeriodEnd: true,
        stripeSubscriptionId: true,
        stripeCustomerId: true,
      },
    });

    // If user doesn't appear to have ACTIVE status, verify with Stripe
    // This self-heals missed webhooks and out-of-sync states
    if (!subscription || subscription.status !== "ACTIVE") {
      const user = await prisma.user.findUnique({
        where: { id: session.user.id },
        select: { email: true },
      });

      try {
        const syncResult = await verifyAndSyncProStatus(
          session.user.id,
          user?.email
        );

        if (syncResult?.synced) {
          // Re-fetch the updated subscription data
          subscription = await prisma.proSubscription.findUnique({
            where: { userId: session.user.id },
            select: {
              status: true,
              plan: true,
              currentPeriodEnd: true,
              cancelAtPeriodEnd: true,
              stripeSubscriptionId: true,
              stripeCustomerId: true,
            },
          });
          console.log(`[Pro Subscribe] Synced subscription status from Stripe for user ${session.user.id}`);
        }
      } catch (syncError) {
        // Don't fail the request if Stripe sync fails - return local data
        console.error("[Pro Subscribe] Stripe sync failed (non-blocking):", syncError);
      }
    }

    if (!subscription) {
      return NextResponse.json({
        isActive: false,
        isPro: false,
        plan: null,
        status: "INACTIVE",
        currentPeriodEnd: null,
        cancelAtPeriodEnd: false,
      });
    }

    return NextResponse.json({
      isActive: subscription.status === "ACTIVE",
      isPro: subscription.status === "ACTIVE",
      plan: subscription.plan,
      status: subscription.status,
      currentPeriodEnd: subscription.currentPeriodEnd,
      cancelAtPeriodEnd: subscription.cancelAtPeriodEnd,
    });
  } catch (error) {
    console.error("[Pro Subscribe] Error fetching status:", error);
    return NextResponse.json(
      { error: "Failed to fetch subscription status" },
      { status: 500 }
    );
  }
}
