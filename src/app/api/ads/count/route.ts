import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { MAX_ACTIVE_ADS } from "@/lib/stripe";

// GET /api/ads/count - Get current user's active ad count and limit status
export async function GET() {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "You must be signed in to view your ad count" },
        { status: 401 }
      );
    }

    const activeCount = await prisma.advertisement.count({
      where: {
        userId: session.user.id,
        status: "ACTIVE",
      },
    });

    const isOverLimit = activeCount >= MAX_ACTIVE_ADS;

    return NextResponse.json({
      activeCount,
      maxActiveAds: MAX_ACTIVE_ADS,
      isOverLimit,
      surchargeRequired: isOverLimit,
    });
  } catch (error) {
    console.error("Error fetching ad count:", error);
    return NextResponse.json(
      { error: "Failed to fetch ad count" },
      { status: 500 }
    );
  }
}
