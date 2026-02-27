import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { credit as creditTokens } from "@/lib/services/tokens.service";

const PRO_MONTHLY_TOKEN_GRANT = 50;

/**
 * POST /api/cron/pro-token-grants
 *
 * Grant monthly tokens to active Pro subscribers who haven't received tokens for the current billing period.
 * Call daily (e.g. 2 AM UTC). Uses CRON_SECRET.
 */
export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization");
    const cronSecret = process.env.CRON_SECRET;
    if (!cronSecret) {
      console.warn("CRON_SECRET not set - skipping authentication for development");
    } else if (authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const now = new Date();

    const subscriptions = await prisma.proSubscription.findMany({
      where: {
        status: "ACTIVE",
        currentPeriodStart: { not: null },
      },
      select: { id: true, userId: true, currentPeriodStart: true, lastTokenGrantAt: true },
    });

    // Grant if we haven't granted this period (lastTokenGrantAt is null or before period start)
    const toGrant = subscriptions.filter((sub) => {
      const periodStart = sub.currentPeriodStart!;
      const lastGrant = sub.lastTokenGrantAt;
      return !lastGrant || lastGrant < periodStart;
    });

    let granted = 0;
    for (const sub of toGrant) {
      try {
        await creditTokens({
          userId: sub.userId,
          amount: PRO_MONTHLY_TOKEN_GRANT,
          type: "PRO_SUBSCRIPTION_GRANT",
          description: "Pro monthly token grant",
          metadata: { periodStart: sub.currentPeriodStart?.toISOString() },
        });
        await prisma.proSubscription.update({
          where: { id: sub.id },
          data: { lastTokenGrantAt: now },
        });
        granted++;
      } catch (err) {
        console.error(`[Cron] Pro token grant failed for user ${sub.userId}:`, err);
      }
    }

    return NextResponse.json({
      success: true,
      granted,
      timestamp: now.toISOString(),
    });
  } catch (error) {
    console.error("[Cron] Pro token grants error:", error);
    return NextResponse.json(
      { error: "Failed to run Pro token grants" },
      { status: 500 }
    );
  }
}
