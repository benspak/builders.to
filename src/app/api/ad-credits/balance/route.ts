import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getAdCreditsBalance } from "@/lib/ad-credits";

/**
 * GET /api/ad-credits/balance
 * Returns the current user's ad credits balance (ensures monthly grant is applied for paid tiers).
 */
export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const balance = await getAdCreditsBalance(session.user.id);
    return NextResponse.json({ balance });
  } catch (error) {
    console.error("[Ad Credits] Error fetching balance:", error);
    return NextResponse.json(
      { error: "Failed to fetch ad credits balance" },
      { status: 500 }
    );
  }
}
