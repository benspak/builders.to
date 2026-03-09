import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getCustomerPortalUrl } from "@/lib/stripe-subscription";

/**
 * POST /api/pro/portal
 * Get Stripe Customer Billing Portal URL for managing subscription (upgrade, downgrade, payment method, cancel).
 */
export async function POST() {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "You must be signed in" },
        { status: 401 }
      );
    }

    const sub = await prisma.proSubscription.findUnique({
      where: { userId: session.user.id },
      select: { plan: true, stripeCustomerId: true },
    });

    if (sub?.plan === "LIFETIME") {
      return NextResponse.json(
        { error: "Lifetime memberships are managed here; there is no billing portal." },
        { status: 400 }
      );
    }

    if (!sub?.stripeCustomerId) {
      return NextResponse.json(
        { error: "No billing account found. Subscribe to a plan first." },
        { status: 400 }
      );
    }

    const baseUrl = process.env.NEXTAUTH_URL || "http://localhost:3000";
    const returnUrl = `${baseUrl}/settings/account`;

    const url = await getCustomerPortalUrl(session.user.id, returnUrl);

    if (!url) {
      return NextResponse.json(
        { error: "Failed to open billing portal" },
        { status: 500 }
      );
    }

    return NextResponse.json({ url });
  } catch (error) {
    console.error("[Pro Portal] Error:", error);
    return NextResponse.json(
      { error: "Failed to open billing portal" },
      { status: 500 }
    );
  }
}
