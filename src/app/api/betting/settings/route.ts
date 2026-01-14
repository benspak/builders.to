import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

/**
 * GET /api/betting/settings
 * Get user's betting settings
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
        bettingEnabled: true,
        stripeConnectId: true,
        stripeConnectOnboarded: true,
        companies: {
          select: {
            id: true,
            name: true,
            bettingEnabled: true,
            stripeConnectId: true,
            stripeConnectOnboarded: true,
          },
        },
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      userBettingEnabled: user.bettingEnabled,
      userStripeConnected: user.stripeConnectOnboarded,
      companies: user.companies.map((c) => ({
        id: c.id,
        name: c.name,
        bettingEnabled: c.bettingEnabled,
        stripeConnected: c.stripeConnectOnboarded,
      })),
    });
  } catch (error) {
    console.error("Error fetching betting settings:", error);
    return NextResponse.json(
      { error: "Failed to fetch betting settings" },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/betting/settings
 * Update betting settings for user or company
 */
export async function PATCH(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "You must be signed in" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { targetType, targetId, bettingEnabled } = body;

    if (typeof bettingEnabled !== "boolean") {
      return NextResponse.json(
        { error: "bettingEnabled must be a boolean" },
        { status: 400 }
      );
    }

    if (targetType === "USER") {
      // Update user betting settings
      if (targetId && targetId !== session.user.id) {
        return NextResponse.json(
          { error: "Cannot update another user's settings" },
          { status: 403 }
        );
      }

      // Check if user has Stripe Connect (required for betting)
      const user = await prisma.user.findUnique({
        where: { id: session.user.id },
        select: {
          stripeConnectOnboarded: true,
          companies: {
            where: {
              stripeConnectOnboarded: true,
            },
            select: { id: true },
          },
        },
      });

      // User needs either personal Stripe Connect or at least one company with Stripe Connect
      if (bettingEnabled && !user?.stripeConnectOnboarded && user?.companies.length === 0) {
        return NextResponse.json(
          { error: "You or your companies must have Stripe Connect set up to enable betting" },
          { status: 400 }
        );
      }

      await prisma.user.update({
        where: { id: session.user.id },
        data: { bettingEnabled },
      });

      return NextResponse.json({
        success: true,
        targetType: "USER",
        bettingEnabled,
      });
    } else if (targetType === "COMPANY") {
      if (!targetId) {
        return NextResponse.json(
          { error: "Company ID is required" },
          { status: 400 }
        );
      }

      // Verify ownership
      const company = await prisma.company.findUnique({
        where: { id: targetId },
        select: {
          userId: true,
          stripeConnectOnboarded: true,
        },
      });

      if (!company) {
        return NextResponse.json(
          { error: "Company not found" },
          { status: 404 }
        );
      }

      if (company.userId !== session.user.id) {
        return NextResponse.json(
          { error: "You do not own this company" },
          { status: 403 }
        );
      }

      if (bettingEnabled && !company.stripeConnectOnboarded) {
        return NextResponse.json(
          { error: "Company must have Stripe Connect set up to enable betting" },
          { status: 400 }
        );
      }

      await prisma.company.update({
        where: { id: targetId },
        data: { bettingEnabled },
      });

      return NextResponse.json({
        success: true,
        targetType: "COMPANY",
        targetId,
        bettingEnabled,
      });
    } else {
      return NextResponse.json(
        { error: "Invalid target type" },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error("Error updating betting settings:", error);
    return NextResponse.json(
      { error: "Failed to update betting settings" },
      { status: 500 }
    );
  }
}
