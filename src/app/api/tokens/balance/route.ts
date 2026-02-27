import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getBalance, getRecentTransactions } from "@/lib/services/tokens.service";

/**
 * GET /api/tokens/balance - Get current user's token balance and recent transactions
 */
export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const [balance, transactions] = await Promise.all([
      getBalance(session.user.id),
      getRecentTransactions(session.user.id, 10),
    ]);

    return NextResponse.json({
      balance,
      transactions,
    });
  } catch (error) {
    console.warn("[Tokens] Balance error (run token migrations?):", error);
    return NextResponse.json(
      { balance: 0, transactions: [] },
      { status: 200 }
    );
  }
}
