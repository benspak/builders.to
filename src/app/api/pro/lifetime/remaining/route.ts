import { NextResponse } from "next/server";
import { getLifetimeRemaining } from "@/lib/stripe-lifetime";

/**
 * GET /api/pro/lifetime/remaining
 * Returns how many lifetime memberships are left. Public (no auth required).
 */
export async function GET() {
  try {
    const data = await getLifetimeRemaining();
    return NextResponse.json(data);
  } catch (error) {
    console.error("[Lifetime Remaining] Error:", error);
    return NextResponse.json(
      { error: "Failed to fetch lifetime remaining" },
      { status: 500 }
    );
  }
}
