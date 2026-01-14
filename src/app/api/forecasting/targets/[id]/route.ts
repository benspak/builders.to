import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getMrrHistory } from "@/lib/stripe-mrr";

/**
 * GET /api/forecasting/targets/[id]
 * Get detailed info for a specific forecast target
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await auth();

    const target = await prisma.forecastTarget.findUnique({
      where: { id },
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
        forecasts: {
          where: { status: "PENDING" },
          select: {
            id: true,
            position: true,
            coinsStaked: true,
            targetMrr: true,
          },
        },
      },
    });

    if (!target || !target.isActive) {
      return NextResponse.json({ error: "Target not found" }, { status: 404 });
    }

    // Get MRR history
    const mrrHistory = await getMrrHistory(id, { limit: 90 });

    // Calculate aggregate forecast stats
    const longForecasts = target.forecasts.filter((f) => f.position === "LONG");
    const shortForecasts = target.forecasts.filter((f) => f.position === "SHORT");

    const totalLongCoins = longForecasts.reduce((sum, f) => sum + f.coinsStaked, 0);
    const totalShortCoins = shortForecasts.reduce((sum, f) => sum + f.coinsStaked, 0);

    // Get user's forecast if logged in
    let userForecast = null;
    if (session?.user?.id) {
      const forecast = await prisma.forecast.findFirst({
        where: {
          userId: session.user.id,
          targetId: id,
          status: "PENDING",
        },
        select: {
          id: true,
          position: true,
          targetMrr: true,
          coinsStaked: true,
          quarterStart: true,
          quarterEnd: true,
          createdAt: true,
        },
      });
      userForecast = forecast;
    }

    // Get recent resolved forecasts for this target
    const recentResults = await prisma.forecast.findMany({
      where: {
        targetId: id,
        status: { in: ["WON", "LOST"] },
      },
      select: {
        id: true,
        position: true,
        targetMrr: true,
        actualMrr: true,
        coinsStaked: true,
        coinsPayout: true,
        status: true,
        resolvedAt: true,
        user: {
          select: {
            id: true,
            name: true,
            image: true,
            slug: true,
          },
        },
      },
      orderBy: { resolvedAt: "desc" },
      take: 10,
    });

    return NextResponse.json({
      id: target.id,
      userId: target.userId,
      founder: target.user,
      currentMrr: target.currentMrr,
      lastMrrUpdate: target.lastMrrUpdate,
      minForecastCoins: target.minForecastCoins,
      maxForecastCoins: target.maxForecastCoins,
      mrrHistory,
      stats: {
        totalForecasts: target.forecasts.length,
        longCount: longForecasts.length,
        shortCount: shortForecasts.length,
        totalLongCoins,
        totalShortCoins,
      },
      userForecast,
      recentResults,
    });
  } catch (error) {
    console.error("Error fetching forecast target:", error);
    return NextResponse.json(
      { error: "Failed to fetch target" },
      { status: 500 }
    );
  }
}
