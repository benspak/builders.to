import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getSellerDashboardLink } from "@/lib/stripe-connect";

/**
 * GET /api/stripe-connect/dashboard
 * Get a login link to the Stripe Express dashboard for the seller
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

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        stripeConnectId: true,
        stripeConnectOnboarded: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    if (!user.stripeConnectId) {
      return NextResponse.json(
        { error: "You need to complete Stripe Connect onboarding first" },
        { status: 400 }
      );
    }

    if (!user.stripeConnectOnboarded) {
      return NextResponse.json(
        { error: "Please complete your Stripe account setup first" },
        { status: 400 }
      );
    }

    const url = await getSellerDashboardLink(user.stripeConnectId);

    return NextResponse.json({ url });
  } catch (error) {
    console.error("Error getting Stripe dashboard link:", error);
    return NextResponse.json(
      { error: "Failed to get dashboard link" },
      { status: 500 }
    );
  }
}
