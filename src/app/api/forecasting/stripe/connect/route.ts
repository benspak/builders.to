import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getStripeOAuthUrl } from "@/lib/stripe-mrr";

/**
 * POST /api/forecasting/stripe/connect
 * Initiate Stripe OAuth connection for the current user (founder)
 */
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Ensure forecast target exists for this user (manual upsert since userId is not @unique)
    const existingTarget = await prisma.forecastTarget.findFirst({
      where: { userId: session.user.id },
    });
    if (!existingTarget) {
      await prisma.forecastTarget.create({
        data: { userId: session.user.id },
      });
    }

    // Generate OAuth URL
    const baseUrl = process.env.NEXTAUTH_URL || "http://localhost:3000";
    const redirectUri = `${baseUrl}/api/forecasting/stripe/callback`;

    const authUrl = getStripeOAuthUrl(session.user.id, redirectUri);

    return NextResponse.json({ url: authUrl });
  } catch (error) {
    console.error("Error initiating Stripe OAuth:", error);
    return NextResponse.json(
      { error: "Failed to initiate Stripe connection" },
      { status: 500 }
    );
  }
}
