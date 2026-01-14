import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { spendCoins, hasEnoughCoins } from "@/lib/coins";

/**
 * POST /api/forecasting/place
 * Place a new forecast on a founder's earnings (MRR)
 */
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { targetId, position, targetMrr, coinsStaked } = body;

    // Validate required fields
    if (!targetId || !position || !targetMrr || !coinsStaked) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Validate position
    if (!["LONG", "SHORT"].includes(position)) {
      return NextResponse.json(
        { error: "Position must be LONG or SHORT" },
        { status: 400 }
      );
    }

    // Validate coins staked
    if (coinsStaked < 1) {
      return NextResponse.json(
        { error: "Must stake at least 1 coin" },
        { status: 400 }
      );
    }

    // Get the forecast target
    const target = await prisma.forecastTarget.findUnique({
      where: { id: targetId },
      select: {
        id: true,
        userId: true,
        isActive: true,
        minForecastCoins: true,
        maxForecastCoins: true,
        currentMrr: true,
        user: {
          select: {
            name: true,
            slug: true,
          },
        },
      },
    });

    if (!target) {
      return NextResponse.json(
        { error: "Forecast target not found" },
        { status: 404 }
      );
    }

    if (!target.isActive) {
      return NextResponse.json(
        { error: "Forecasting is not enabled for this founder" },
        { status: 400 }
      );
    }

    // Can't forecast yourself
    if (target.userId === session.user.id) {
      return NextResponse.json(
        { error: "You cannot forecast on yourself" },
        { status: 400 }
      );
    }

    // Validate coins within limits
    if (coinsStaked < target.minForecastCoins) {
      return NextResponse.json(
        { error: `Minimum stake is ${target.minForecastCoins} coins` },
        { status: 400 }
      );
    }

    if (coinsStaked > target.maxForecastCoins) {
      return NextResponse.json(
        { error: `Maximum stake is ${target.maxForecastCoins} coins` },
        { status: 400 }
      );
    }

    // Validate target MRR (must be a positive number)
    if (targetMrr < 0) {
      return NextResponse.json(
        { error: "Target MRR must be positive" },
        { status: 400 }
      );
    }

    // Check if user already has a pending forecast on this target
    const existingForecast = await prisma.forecast.findFirst({
      where: {
        userId: session.user.id,
        targetId,
        status: "PENDING",
      },
    });

    if (existingForecast) {
      return NextResponse.json(
        { error: "You already have a pending forecast on this founder" },
        { status: 400 }
      );
    }

    // Check if user has enough coins
    const hasCoins = await hasEnoughCoins(session.user.id, coinsStaked);
    if (!hasCoins) {
      return NextResponse.json(
        { error: "Insufficient coin balance" },
        { status: 400 }
      );
    }

    // Calculate resolution date (24 hours from now)
    const quarterStart = new Date();
    const quarterEnd = new Date();
    quarterEnd.setDate(quarterEnd.getDate() + 1);

    // Create the forecast and spend coins in a transaction
    const forecast = await prisma.$transaction(async (tx) => {
      // Spend the coins
      await spendCoins(
        session.user.id,
        coinsStaked,
        "FORECAST_PLACED",
        `Forecast placed on ${target.user.name ?? "a founder"}`,
        { targetId, position, targetMrr }
      );

      // Create the forecast
      const newForecast = await tx.forecast.create({
        data: {
          userId: session.user.id,
          targetId,
          position,
          targetMrr,
          coinsStaked,
          quarterStart,
          quarterEnd,
          status: "PENDING",
        },
        include: {
          target: {
            include: {
              user: {
                select: {
                  name: true,
                  slug: true,
                  image: true,
                },
              },
            },
          },
        },
      });

      return newForecast;
    });

    return NextResponse.json({
      id: forecast.id,
      position: forecast.position,
      targetMrr: forecast.targetMrr,
      coinsStaked: forecast.coinsStaked,
      quarterStart: forecast.quarterStart,
      quarterEnd: forecast.quarterEnd,
      founder: forecast.target.user,
      message: `Successfully placed ${position} forecast on ${target.user.name ?? "a founder"}`,
    });
  } catch (error) {
    console.error("Error placing forecast:", error);

    if (error instanceof Error && error.message === "Insufficient coin balance") {
      return NextResponse.json(
        { error: "Insufficient coin balance" },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Failed to place forecast" },
      { status: 500 }
    );
  }
}
