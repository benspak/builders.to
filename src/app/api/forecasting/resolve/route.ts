import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { grantCoins, updateForecastAccuracy, checkAndGrantAccuracyBonus } from "@/lib/coins";
import { updateAllTargetsMrr } from "@/lib/stripe-mrr";

// This should be called by a cron job (e.g., daily)
// Requires a secret key for authorization

/**
 * POST /api/forecasting/resolve
 * Resolve expired forecasts and distribute coins
 * This should be called by a daily cron job
 */
export async function POST(request: NextRequest) {
  try {
    // Verify cron secret
    const authHeader = request.headers.get("authorization");
    const cronSecret = process.env.CRON_SECRET;

    if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const now = new Date();
    const results = {
      mrrUpdates: { total: 0, success: 0, failed: 0 },
      resolvedForecasts: { total: 0, won: 0, lost: 0, errors: [] as string[] },
    };

    // Step 1: Update MRR for all active targets
    console.log("Updating MRR for all targets...");
    const mrrResults = await updateAllTargetsMrr();
    results.mrrUpdates = {
      total: mrrResults.total,
      success: mrrResults.success,
      failed: mrrResults.failed,
    };

    // Step 2: Find all forecasts that are pending and have reached their quarter end
    console.log("Finding forecasts to resolve...");
    const forecastsToResolve = await prisma.forecast.findMany({
      where: {
        status: "PENDING",
        quarterEnd: { lte: now },
      },
      include: {
        target: {
          select: {
            currentMrr: true,
            user: { select: { name: true } },
          },
        },
        user: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    console.log(`Found ${forecastsToResolve.length} forecasts to resolve`);
    results.resolvedForecasts.total = forecastsToResolve.length;

    // Step 3: Resolve each forecast
    for (const forecast of forecastsToResolve) {
      try {
        const actualMrr = forecast.target.currentMrr;

        if (actualMrr === null) {
          // Skip if we don't have MRR data
          results.resolvedForecasts.errors.push(
            `Forecast ${forecast.id}: No MRR data available`
          );
          continue;
        }

        // Determine if forecast is won or lost
        // LONG wins if actual MRR >= target MRR
        // SHORT wins if actual MRR < target MRR
        const isWin =
          (forecast.position === "LONG" && actualMrr >= forecast.targetMrr) ||
          (forecast.position === "SHORT" && actualMrr < forecast.targetMrr);

        const status = isWin ? "WON" : "LOST";
        const coinsPayout = isWin ? forecast.coinsStaked * 2 : 0;

        // Update forecast status
        await prisma.forecast.update({
          where: { id: forecast.id },
          data: {
            status,
            resolvedAt: now,
            actualMrr,
            coinsPayout,
          },
        });

        // If won, grant coins
        if (isWin) {
          await grantCoins(
            forecast.userId,
            coinsPayout,
            "FORECAST_WON",
            `Won ${forecast.position} forecast on ${forecast.target.user.name ?? "a founder"}`,
            {
              forecastId: forecast.id,
              targetMrr: forecast.targetMrr,
              actualMrr,
              coinsStaked: forecast.coinsStaked,
            }
          );
          results.resolvedForecasts.won++;
        } else {
          // Record the loss (coins were already deducted when forecast was placed)
          await prisma.coinTransaction.create({
            data: {
              userId: forecast.userId,
              amount: 0, // No change - coins were already spent
              type: "FORECAST_LOST",
              description: `Lost ${forecast.position} forecast on ${forecast.target.user.name ?? "a founder"}`,
              metadata: {
                forecastId: forecast.id,
                targetMrr: forecast.targetMrr,
                actualMrr,
                coinsStaked: forecast.coinsStaked,
              },
            },
          });
          results.resolvedForecasts.lost++;
        }

        // Update user's accuracy stats
        const accuracyStats = await updateForecastAccuracy(forecast.userId);

        // Check for accuracy bonus
        if (accuracyStats.accuracy !== null) {
          await checkAndGrantAccuracyBonus(forecast.userId, accuracyStats.accuracy);
        }

        console.log(
          `Resolved forecast ${forecast.id}: ${status} (${forecast.user.name})`
        );
      } catch (err) {
        console.error(`Error resolving forecast ${forecast.id}:`, err);
        results.resolvedForecasts.errors.push(
          `Forecast ${forecast.id}: ${err instanceof Error ? err.message : "Unknown error"}`
        );
      }
    }

    return NextResponse.json({
      success: true,
      timestamp: now.toISOString(),
      results,
    });
  } catch (error) {
    console.error("Error in resolve endpoint:", error);
    return NextResponse.json(
      { error: "Failed to resolve forecasts" },
      { status: 500 }
    );
  }
}

/**
 * GET /api/forecasting/resolve
 * Get status of recent resolutions (for debugging)
 */
export async function GET(request: NextRequest) {
  try {
    // Verify cron secret
    const authHeader = request.headers.get("authorization");
    const cronSecret = process.env.CRON_SECRET;

    if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get counts of forecasts by status
    const stats = await prisma.forecast.groupBy({
      by: ["status"],
      _count: true,
    });

    // Get pending forecasts that are ready to be resolved
    const readyToResolve = await prisma.forecast.count({
      where: {
        status: "PENDING",
        quarterEnd: { lte: new Date() },
      },
    });

    // Get recently resolved forecasts
    const recentResolutions = await prisma.forecast.findMany({
      where: {
        status: { in: ["WON", "LOST"] },
      },
      select: {
        id: true,
        status: true,
        position: true,
        targetMrr: true,
        actualMrr: true,
        coinsStaked: true,
        coinsPayout: true,
        resolvedAt: true,
        user: {
          select: {
            name: true,
          },
        },
        target: {
          select: {
            user: { select: { name: true } },
          },
        },
      },
      orderBy: { resolvedAt: "desc" },
      take: 10,
    });

    return NextResponse.json({
      stats: stats.reduce(
        (acc, s) => ({ ...acc, [s.status]: s._count }),
        {} as Record<string, number>
      ),
      readyToResolve,
      recentResolutions,
    });
  } catch (error) {
    console.error("Error fetching resolve status:", error);
    return NextResponse.json(
      { error: "Failed to fetch status" },
      { status: 500 }
    );
  }
}
