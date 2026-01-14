import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getUserForecastStats, getCoinTransactionHistory } from "@/lib/coins";

/**
 * GET /api/forecasting/coins
 * Get current user's coin balance and stats
 */
export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const stats = await getUserForecastStats(session.user.id);
    const { transactions } = await getCoinTransactionHistory(session.user.id, {
      limit: 10,
    });

    return NextResponse.json({
      ...stats,
      recentTransactions: transactions,
    });
  } catch (error) {
    console.error("Error fetching coin balance:", error);
    return NextResponse.json(
      { error: "Failed to fetch coin balance" },
      { status: 500 }
    );
  }
}
