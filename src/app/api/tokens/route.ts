import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getBalance, getTransactionHistory, tokensToDollars } from "@/lib/tokens";
import { TokenTransactionType } from "@prisma/client";

/**
 * GET /api/tokens
 * Get current user's token balance and optionally transaction history
 * Query params:
 * - history: boolean - include transaction history (default: false)
 * - limit: number - max transactions to return (default: 20, max: 100)
 * - cursor: string - pagination cursor
 * - type: TokenTransactionType - filter by transaction type
 */
export async function GET(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "You must be signed in" },
        { status: 401 }
      );
    }

    const searchParams = request.nextUrl.searchParams;
    const includeHistory = searchParams.get("history") === "true";
    const limit = Math.min(
      parseInt(searchParams.get("limit") || "20", 10),
      100
    );
    const cursor = searchParams.get("cursor") || undefined;
    const typeParam = searchParams.get("type");
    const type = typeParam && Object.values(TokenTransactionType).includes(typeParam as TokenTransactionType)
      ? (typeParam as TokenTransactionType)
      : undefined;

    // Get balance
    const balance = await getBalance(session.user.id);

    // Optionally get transaction history
    let history = undefined;
    if (includeHistory) {
      history = await getTransactionHistory(session.user.id, {
        limit,
        cursor,
        type,
      });
    }

    return NextResponse.json({
      balance,
      dollarValue: tokensToDollars(balance),
      ...(history && {
        transactions: history.transactions,
        nextCursor: history.nextCursor,
      }),
    });
  } catch (error) {
    console.error("Error fetching tokens:", error);
    return NextResponse.json(
      { error: "Failed to fetch token data" },
      { status: 500 }
    );
  }
}
