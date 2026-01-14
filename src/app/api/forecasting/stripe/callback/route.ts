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
    const state = searchParams.get("state"); // companyId
    const error = searchParams.get("error");
    const errorDescription = searchParams.get("error_description");

    const baseUrl = process.env.NEXTAUTH_URL || "http://localhost:3000";

    // Handle OAuth errors
    if (error) {
      console.error("Stripe OAuth error:", error, errorDescription);
      return NextResponse.redirect(
        new URL(
          `/my-companies?error=${encodeURIComponent(errorDescription || error)}`,
          baseUrl
        )
      );
    }

    if (!code || !state) {
      return NextResponse.redirect(
        new URL("/my-companies?error=Invalid+callback+parameters", baseUrl)
      );
    }

    const companyId = state;

    // Verify user owns the company
    const company = await prisma.company.findUnique({
      where: { id: companyId },
      select: {
        id: true,
        userId: true,
        slug: true,
        members: {
          where: {
            userId: session.user.id,
            role: { in: ["OWNER", "ADMIN"] },
          },
        },
      },
    });

    if (!company) {
      return NextResponse.redirect(
        new URL("/my-companies?error=Company+not+found", baseUrl)
      );
    }

    const isOwnerOrAdmin =
      company.userId === session.user.id || company.members.length > 0;

    if (!isOwnerOrAdmin) {
      return NextResponse.redirect(
        new URL("/my-companies?error=Access+denied", baseUrl)
      );
    }

    // Exchange code for tokens
    const tokens = await exchangeStripeOAuthCode(code);

    // Update forecast target with Stripe connection
    const forecastTarget = await prisma.forecastTarget.upsert({
      where: { companyId },
      create: {
        companyId,
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

    // Redirect to company settings with success message
    const redirectUrl = company.slug
      ? `/companies/${company.slug}?forecasting=connected`
      : `/my-companies?forecasting=connected`;

    return NextResponse.redirect(new URL(redirectUrl, baseUrl));
  } catch (error) {
    console.error("Error handling Stripe OAuth callback:", error);
    const baseUrl = process.env.NEXTAUTH_URL || "http://localhost:3000";
    return NextResponse.redirect(
      new URL(
        `/my-companies?error=${encodeURIComponent("Failed to connect Stripe")}`,
        baseUrl
      )
    );
  }
}
