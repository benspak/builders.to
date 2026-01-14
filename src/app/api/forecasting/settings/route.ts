import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

/**
 * GET /api/forecasting/settings
 * Get forecasting settings for the current user (founder)
 */
export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get or create forecast target
    let forecastTarget = await prisma.forecastTarget.findUnique({
      where: { userId: session.user.id },
      select: {
        id: true,
        isActive: true,
        minForecastCoins: true,
        maxForecastCoins: true,
        stripeAccountId: true,
        stripeConnectedAt: true,
        currentMrr: true,
        lastMrrUpdate: true,
      },
    });

    if (!forecastTarget) {
      // Create a new forecast target for this user
      forecastTarget = await prisma.forecastTarget.create({
        data: {
          userId: session.user.id,
          isActive: false,
        },
        select: {
          id: true,
          isActive: true,
          minForecastCoins: true,
          maxForecastCoins: true,
          stripeAccountId: true,
          stripeConnectedAt: true,
          currentMrr: true,
          lastMrrUpdate: true,
        },
      });
    }

    return NextResponse.json({
      ...forecastTarget,
      userId: session.user.id,
      hasStripeConnection: !!forecastTarget.stripeAccountId,
    });
  } catch (error) {
    console.error("Error fetching forecasting settings:", error);
    return NextResponse.json(
      { error: "Failed to fetch settings" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/forecasting/settings
 * Update forecasting settings for the current user (founder)
 */
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { isActive, minForecastCoins, maxForecastCoins } = body;

    // Get existing forecast target
    const existingTarget = await prisma.forecastTarget.findUnique({
      where: { userId: session.user.id },
      select: {
        id: true,
        stripeAccountId: true,
      },
    });

    // Can only activate if Stripe is connected
    if (isActive === true && !existingTarget?.stripeAccountId) {
      return NextResponse.json(
        { error: "Connect Stripe before enabling forecasting" },
        { status: 400 }
      );
    }

    // Validate coin limits
    const min = minForecastCoins ?? 10;
    const max = maxForecastCoins ?? 100;

    if (min < 1 || max < min || max > 1000) {
      return NextResponse.json(
        { error: "Invalid coin limits" },
        { status: 400 }
      );
    }

    // Update or create forecast target
    const forecastTarget = await prisma.forecastTarget.upsert({
      where: { userId: session.user.id },
      create: {
        userId: session.user.id,
        isActive: isActive ?? false,
        minForecastCoins: min,
        maxForecastCoins: max,
      },
      update: {
        ...(typeof isActive === "boolean" && { isActive }),
        ...(minForecastCoins && { minForecastCoins: min }),
        ...(maxForecastCoins && { maxForecastCoins: max }),
      },
      select: {
        id: true,
        isActive: true,
        minForecastCoins: true,
        maxForecastCoins: true,
        stripeAccountId: true,
        stripeConnectedAt: true,
        currentMrr: true,
        lastMrrUpdate: true,
      },
    });

    return NextResponse.json({
      ...forecastTarget,
      userId: session.user.id,
      hasStripeConnection: !!forecastTarget.stripeAccountId,
    });
  } catch (error) {
    console.error("Error updating forecasting settings:", error);
    return NextResponse.json(
      { error: "Failed to update settings" },
      { status: 500 }
    );
  }
}
