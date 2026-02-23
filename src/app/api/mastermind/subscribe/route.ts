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
    console.error("[Mastermind Subscribe] Error:", error);
    return NextResponse.json(
      { error: "Failed to create checkout session" },
      { status: 500 }
    );
  }
}

/**
 * GET /api/mastermind/subscribe
 * Get current Mastermind subscription status
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
    console.error("[Mastermind Subscribe] Error fetching status:", error);
    return NextResponse.json(
      { error: "Failed to fetch subscription status" },
      { status: 500 }
    );
  }
}
