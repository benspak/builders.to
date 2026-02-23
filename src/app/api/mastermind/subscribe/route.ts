import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { createMastermindCheckoutSession } from "@/lib/stripe-mastermind";

/**
 * POST /api/mastermind/subscribe
 * Create a Stripe Checkout session for Mastermind ($9/mo) subscription
 */
export async function POST() {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "You must be signed in to join Mastermind" },
        { status: 401 }
      );
    }

    if (!process.env.STRIPE_MASTERMIND_MONTHLY_PRICE_ID?.trim()) {
      console.error("[Mastermind Subscribe] STRIPE_MASTERMIND_MONTHLY_PRICE_ID is not set");
      return NextResponse.json(
        { error: "Mastermind subscription is not configured. Please add STRIPE_MASTERMIND_MONTHLY_PRICE_ID to your environment." },
        { status: 503 }
      );
    }

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

    const existing = await prisma.mastermindSubscription.findUnique({
      where: { userId: session.user.id },
      select: { status: true },
    });

    if (existing?.status === "ACTIVE") {
      return NextResponse.json(
        { error: "You already have an active Mastermind subscription" },
        { status: 400 }
      );
    }

    const baseUrl = process.env.NEXTAUTH_URL || "http://localhost:3000";
    const returnUrl = `${baseUrl}/feed`;

    const { sessionId, url } = await createMastermindCheckoutSession(
      session.user.id,
      user.email,
      returnUrl
    );

    return NextResponse.json({ sessionId, url });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    const stack = error instanceof Error ? error.stack : undefined;
    console.error("[Mastermind Subscribe] POST Error:", message, stack ?? "");

    // Missing table or schema not migrated
    if (
      typeof message === "string" &&
      (message.includes("MastermindSubscription") ||
        message.includes("does not exist") ||
        message.includes("Unknown arg") ||
        message.includes("Invalid `prisma.mastermindSubscription"))
    ) {
      return NextResponse.json(
        {
          error:
            "Mastermind is not set up yet. Run database migrations (e.g. npx prisma migrate deploy) and set STRIPE_MASTERMIND_MONTHLY_PRICE_ID.",
        },
        { status: 503 }
      );
    }

    return NextResponse.json(
      { error: "Failed to create checkout session" },
      { status: 500 }
    );
  }
}

/**
 * GET /api/mastermind/subscribe
 * Get current Mastermind subscription status.
 * On any error (e.g. missing table), returns isActive: false so the feed still loads.
 */
export async function GET() {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { isActive: false, error: "Not signed in" },
        { status: 200 }
      );
    }

    const sub = await prisma.mastermindSubscription.findUnique({
      where: { userId: session.user.id },
      select: { status: true, currentPeriodEnd: true, cancelAtPeriodEnd: true },
    });

    return NextResponse.json({
      isActive: sub?.status === "ACTIVE",
      currentPeriodEnd: sub?.currentPeriodEnd ?? null,
      cancelAtPeriodEnd: sub?.cancelAtPeriodEnd ?? false,
    });
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    console.error("[Mastermind Subscribe] GET error (returning isActive: false):", msg);
    // Return safe default so the feed page doesn't 500 (e.g. if migration not run)
    return NextResponse.json({
      isActive: false,
      currentPeriodEnd: null,
      cancelAtPeriodEnd: false,
    });
  }
}
