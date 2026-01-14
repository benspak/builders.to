import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

/**
 * GET /api/forecasting/targets
 * List all active forecast targets (founders available for forecasting)
 */
export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    const { searchParams } = new URL(request.url);

    const limit = parseInt(searchParams.get("limit") || "20");
    const cursor = searchParams.get("cursor");
    const sortBy = searchParams.get("sortBy") || "mrr"; // mrr, forecasts, newest

    // Build order clause
    let orderBy: object;
    switch (sortBy) {
      case "forecasts":
        orderBy = { forecasts: { _count: "desc" } };
        break;
      case "newest":
        orderBy = { createdAt: "desc" };
        break;
      case "mrr":
      default:
        orderBy = { currentMrr: "desc" };
        break;
    }

    const targets = await prisma.forecastTarget.findMany({
      where: {
        isActive: true,
        stripeAccountId: { not: null },
        currentMrr: { not: null },
        userId: { not: null }, // exclude legacy rows not yet backfilled
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            image: true,
            slug: true,
            headline: true,
          },
        },
        _count: {
          select: {
            forecasts: true,
          },
        },
      },
      orderBy,
      take: limit + 1,
      ...(cursor && {
        cursor: { id: cursor },
        skip: 1,
      }),
    });

    // Check for next page
    let nextCursor: string | undefined;
    if (targets.length > limit) {
      const nextItem = targets.pop();
      nextCursor = nextItem?.id;
    }

    // If user is logged in, get their forecasts for these targets
    let userForecasts: Record<string, { position: string; coinsStaked: number }> = {};
    if (session?.user?.id) {
      const forecasts = await prisma.forecast.findMany({
        where: {
          userId: session.user.id,
          targetId: { in: targets.map((t) => t.id) },
          status: "PENDING",
        },
        select: {
          targetId: true,
          position: true,
          coinsStaked: true,
        },
      });

      userForecasts = forecasts.reduce((acc, f) => {
        acc[f.targetId] = { position: f.position, coinsStaked: f.coinsStaked };
        return acc;
      }, {} as Record<string, { position: string; coinsStaked: number }>);
    }

    // Format response
    const formattedTargets = targets.map((target) => ({
      id: target.id,
      userId: target.userId,
      founder: target.user,
      currentMrr: target.currentMrr,
      lastMrrUpdate: target.lastMrrUpdate,
      minForecastCoins: target.minForecastCoins,
      maxForecastCoins: target.maxForecastCoins,
      totalForecasts: target._count.forecasts,
      userForecast: userForecasts[target.id] || null,
    }));

    return NextResponse.json({
      targets: formattedTargets,
      nextCursor,
    });
  } catch (error) {
    console.error("Error fetching forecast targets:", error);
    return NextResponse.json(
      { error: "Failed to fetch targets" },
      { status: 500 }
    );
  }
}
