import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getTransactionHistory } from "@/lib/tokens";
import { TokenTransactionType } from "@prisma/client";

/**
 * GET /api/tokens/history
 * Get detailed token transaction history with pagination
 * Query params:
 * - limit: number - max transactions to return (default: 20, max: 100)
 * - cursor: string - pagination cursor for next page
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
    const limit = Math.min(
      parseInt(searchParams.get("limit") || "20", 10),
      100
    );
    const cursor = searchParams.get("cursor") || undefined;
    const typeParam = searchParams.get("type");
    const type = typeParam && Object.values(TokenTransactionType).includes(typeParam as TokenTransactionType)
      ? (typeParam as TokenTransactionType)
      : undefined;

    const history = await getTransactionHistory(session.user.id, {
      limit,
      cursor,
      type,
    });

    return NextResponse.json({
      transactions: history.transactions,
      nextCursor: history.nextCursor,
      hasMore: !!history.nextCursor,
    });
  } catch (error) {
    console.error("Error fetching token history:", error);
    return NextResponse.json(
      { error: "Failed to fetch transaction history" },
      { status: 500 }
    );
  }
}
