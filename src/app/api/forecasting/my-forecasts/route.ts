import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getUserForecastStats } from "@/lib/coins";

/**
 * GET /api/forecasting/my-forecasts
 * Get the current user's forecasts and stats
 */
export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status"); // pending, resolved, all
    const limit = parseInt(searchParams.get("limit") || "20");
    const cursor = searchParams.get("cursor");

    // Build where clause
    const whereClause: {
      userId: string;
      status?: { in: string[] } | string;
    } = {
      userId: session.user.id,
    };

    if (status === "pending") {
      whereClause.status = "PENDING";
    } else if (status === "resolved") {
      whereClause.status = { in: ["WON", "LOST", "CANCELLED"] };
    }

    // Get forecasts
    const forecasts = await prisma.forecast.findMany({
      where: whereClause,
      include: {
        target: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                slug: true,
                image: true,
                headline: true,
              },
            },
          },
        },
      },
      orderBy: { createdAt: "desc" },
      take: limit + 1,
      ...(cursor && {
        cursor: { id: cursor },
        skip: 1,
      }),
    });

    // Check for next page
    let nextCursor: string | undefined;
    if (forecasts.length > limit) {
      const nextItem = forecasts.pop();
      nextCursor = nextItem?.id;
    }

    // Get user's forecast stats
    const stats = await getUserForecastStats(session.user.id);

    // Format forecasts
    const formattedForecasts = forecasts.map((f) => ({
      id: f.id,
      position: f.position,
      targetMrr: f.targetMrr,
      coinsStaked: f.coinsStaked,
      quarterStart: f.quarterStart,
      quarterEnd: f.quarterEnd,
      status: f.status,
      resolvedAt: f.resolvedAt,
      actualMrr: f.actualMrr,
      coinsPayout: f.coinsPayout,
      createdAt: f.createdAt,
      founder: f.target.user,
      currentMrr: f.target.currentMrr,
      daysRemaining:
        f.status === "PENDING"
          ? Math.max(
              0,
              Math.ceil(
                (new Date(f.quarterEnd).getTime() - Date.now()) /
                  (1000 * 60 * 60 * 24)
              )
            )
          : null,
    }));

    return NextResponse.json({
      forecasts: formattedForecasts,
      nextCursor,
      stats,
    });
  } catch (error) {
    console.error("Error fetching user forecasts:", error);
    return NextResponse.json(
      { error: "Failed to fetch forecasts" },
      { status: 500 }
    );
  }
}
