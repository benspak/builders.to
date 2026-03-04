import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { createLifetimeCheckoutSession } from "@/lib/stripe-lifetime";

/**
 * POST /api/pro/lifetime/checkout
 * Create a Stripe Checkout session for lifetime membership. Requires auth.
 */
export async function POST() {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "You must be signed in to purchase a lifetime membership" },
        { status: 401 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { email: true },
    });

    if (!user?.email) {
      return NextResponse.json(
        { error: "You must have an email address to purchase" },
        { status: 400 }
      );
    }

    const baseUrl = process.env.NEXTAUTH_URL || "http://localhost:3000";
    const returnUrl = `${baseUrl}/settings/account`;

    const { sessionId, url } = await createLifetimeCheckoutSession(
      session.user.id,
      user.email,
      returnUrl
    );

    return NextResponse.json({ sessionId, url });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to create checkout";
    console.error("[Lifetime Checkout] Error:", error);
    return NextResponse.json(
      { error: message },
      { status: 400 }
    );
  }
}
