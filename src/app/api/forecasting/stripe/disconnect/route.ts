import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { disconnectStripe } from "@/lib/stripe-mrr";

/**
 * POST /api/forecasting/stripe/disconnect
 * Disconnect Stripe from the current user's forecasting
 */
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get forecast target
    const forecastTarget = await prisma.forecastTarget.findUnique({
      where: { userId: session.user.id },
      select: { id: true },
    });

    if (!forecastTarget) {
      return NextResponse.json(
        { error: "Forecasting not enabled for this account" },
        { status: 404 }
      );
    }

    // Check for pending forecasts
    const pendingForecasts = await prisma.forecast.count({
      where: {
        targetId: forecastTarget.id,
        status: "PENDING",
      },
    });

    if (pendingForecasts > 0) {
      return NextResponse.json(
        {
          error: `Cannot disconnect Stripe with ${pendingForecasts} pending forecasts. Wait for them to resolve first.`,
        },
        { status: 400 }
      );
    }

    // Disconnect Stripe
    await disconnectStripe(forecastTarget.id);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error disconnecting Stripe:", error);
    return NextResponse.json(
      { error: "Failed to disconnect Stripe" },
      { status: 500 }
    );
  }
}
