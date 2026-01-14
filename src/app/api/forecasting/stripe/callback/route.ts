import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { exchangeStripeOAuthCode, updateTargetMrr } from "@/lib/stripe-mrr";

/**
 * GET /api/forecasting/stripe/callback
 * Handle Stripe OAuth callback
 */
export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.redirect(new URL("/signin", request.url));
    }

    const { searchParams } = new URL(request.url);
    const code = searchParams.get("code");
    const state = searchParams.get("state"); // userId
    const error = searchParams.get("error");
    const errorDescription = searchParams.get("error_description");

    const baseUrl = process.env.NEXTAUTH_URL || "http://localhost:3000";

    // Handle OAuth errors
    if (error) {
      console.error("Stripe OAuth error:", error, errorDescription);
      return NextResponse.redirect(
        new URL(
          `/settings?error=${encodeURIComponent(errorDescription || error)}`,
          baseUrl
        )
      );
    }

    if (!code || !state) {
      return NextResponse.redirect(
        new URL("/settings?error=Invalid+callback+parameters", baseUrl)
      );
    }

    const userId = state;

    // Ensure the callback is for the signed-in user
    if (userId !== session.user.id) {
      return NextResponse.redirect(
        new URL("/settings?error=Access+denied", baseUrl)
      );
    }

    // Exchange code for tokens
    const tokens = await exchangeStripeOAuthCode(code);

    // Update forecast target with Stripe connection
    const forecastTarget = await prisma.forecastTarget.upsert({
      where: { userId },
      create: {
        userId,
        stripeAccountId: tokens.stripeUserId,
        stripeAccessToken: tokens.accessToken,
        stripeRefreshToken: tokens.refreshToken,
        stripeConnectedAt: new Date(),
        isActive: false, // User still needs to manually activate
      },
      update: {
        stripeAccountId: tokens.stripeUserId,
        stripeAccessToken: tokens.accessToken,
        stripeRefreshToken: tokens.refreshToken,
        stripeConnectedAt: new Date(),
      },
    });

    // Fetch initial MRR
    await updateTargetMrr(forecastTarget.id);

    return NextResponse.redirect(new URL("/settings?forecasting=connected", baseUrl));
  } catch (error) {
    console.error("Error handling Stripe OAuth callback:", error);
    const baseUrl = process.env.NEXTAUTH_URL || "http://localhost:3000";
    return NextResponse.redirect(
      new URL(
        `/settings?error=${encodeURIComponent("Failed to connect Stripe")}`,
        baseUrl
      )
    );
  }
}
