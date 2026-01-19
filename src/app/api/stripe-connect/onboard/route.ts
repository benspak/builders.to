import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import {
  createConnectAccountLink,
  createAccountLinkForExisting,
  isAccountOnboarded,
} from "@/lib/stripe-connect";
import { MIN_LAUNCHED_PROJECTS_FOR_LISTING } from "@/lib/stripe";

/**
 * POST /api/stripe-connect/onboard
 * Start or continue Stripe Connect onboarding for a seller
 */
export async function POST() {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "You must be signed in to become a seller" },
        { status: 401 }
      );
    }

    // Get the user with their projects count
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        email: true,
        stripeConnectId: true,
        stripeConnectOnboarded: true,
        _count: {
          select: {
            projects: {
              where: { status: "LAUNCHED" },
            },
          },
        },
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Verify minimum launched projects requirement
    if (user._count.projects < MIN_LAUNCHED_PROJECTS_FOR_LISTING) {
      return NextResponse.json(
        {
          error: `You need at least ${MIN_LAUNCHED_PROJECTS_FOR_LISTING} launched projects to sell services`,
          launchedProjects: user._count.projects,
          required: MIN_LAUNCHED_PROJECTS_FOR_LISTING,
        },
        { status: 403 }
      );
    }

    if (!user.email) {
      return NextResponse.json(
        { error: "Email is required to become a seller" },
        { status: 400 }
      );
    }

    const baseUrl = process.env.NEXTAUTH_URL || "http://localhost:3000";
    const returnUrl = `${baseUrl}/settings?onboarding=complete`;
    const refreshUrl = `${baseUrl}/settings?onboarding=refresh`;

    // If user already has a Connect account, create a new link
    if (user.stripeConnectId) {
      // Check if already fully onboarded
      const onboarded = await isAccountOnboarded(user.stripeConnectId);

      if (onboarded && !user.stripeConnectOnboarded) {
        // Update the user record
        await prisma.user.update({
          where: { id: user.id },
          data: { stripeConnectOnboarded: true },
        });

        return NextResponse.json({
          success: true,
          alreadyOnboarded: true,
          message: "Your Stripe account is already set up!",
        });
      }

      if (onboarded) {
        return NextResponse.json({
          success: true,
          alreadyOnboarded: true,
          message: "Your Stripe account is already set up!",
        });
      }

      // Create a new account link to complete onboarding
      const url = await createAccountLinkForExisting(
        user.stripeConnectId,
        returnUrl,
        refreshUrl
      );

      return NextResponse.json({ url });
    }

    // Create a new Connect account and start onboarding
    const { accountId, url } = await createConnectAccountLink(
      user.id,
      user.email,
      returnUrl,
      refreshUrl
    );

    // Store the Connect account ID
    await prisma.user.update({
      where: { id: user.id },
      data: { stripeConnectId: accountId },
    });

    return NextResponse.json({ url, accountId });
  } catch (error) {
    console.error("Error starting Stripe Connect onboarding:", error);

    // Return more specific error messages
    const errorMessage = error instanceof Error ? error.message : "Unknown error";

    // Check for common Stripe errors
    if (errorMessage.includes("platform")) {
      return NextResponse.json(
        { error: "Stripe Connect is not enabled for this account. Please enable Connect in the Stripe Dashboard." },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { error: `Failed to start onboarding: ${errorMessage}` },
      { status: 500 }
    );
  }
}

/**
 * GET /api/stripe-connect/onboard
 * Check onboarding status
 */
export async function GET() {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "You must be signed in" },
        { status: 401 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        stripeConnectId: true,
        stripeConnectOnboarded: true,
        _count: {
          select: {
            projects: {
              where: { status: "LAUNCHED" },
            },
          },
        },
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Check eligibility
    const isEligible = user._count.projects >= MIN_LAUNCHED_PROJECTS_FOR_LISTING;

    if (!user.stripeConnectId) {
      return NextResponse.json({
        hasAccount: false,
        isOnboarded: false,
        isEligible,
        launchedProjects: user._count.projects,
        required: MIN_LAUNCHED_PROJECTS_FOR_LISTING,
      });
    }

    // Check actual onboarding status with Stripe
    const onboarded = await isAccountOnboarded(user.stripeConnectId);

    // Update local record if needed
    if (onboarded && !user.stripeConnectOnboarded) {
      await prisma.user.update({
        where: { id: session.user.id },
        data: { stripeConnectOnboarded: true },
      });
    }

    return NextResponse.json({
      hasAccount: true,
      isOnboarded: onboarded,
      isEligible,
      launchedProjects: user._count.projects,
      required: MIN_LAUNCHED_PROJECTS_FOR_LISTING,
    });
  } catch (error) {
    console.error("Error checking onboarding status:", error);
    return NextResponse.json(
      { error: "Failed to check status" },
      { status: 500 }
    );
  }
}
