import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

/**
 * GET /api/forecasting/settings?companyId=xxx
 * Get forecasting settings for a company
 */
export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const companyId = searchParams.get("companyId");

    if (!companyId) {
      return NextResponse.json(
        { error: "companyId is required" },
        { status: 400 }
      );
    }

    // Check if user owns the company
    const company = await prisma.company.findUnique({
      where: { id: companyId },
      select: {
        id: true,
        name: true,
        userId: true,
        members: {
          where: {
            userId: session.user.id,
            role: { in: ["OWNER", "ADMIN"] },
          },
        },
      },
    });

    if (!company) {
      return NextResponse.json({ error: "Company not found" }, { status: 404 });
    }

    // Check if user is owner or admin
    const isOwnerOrAdmin =
      company.userId === session.user.id || company.members.length > 0;

    if (!isOwnerOrAdmin) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Get or create forecast target
    let forecastTarget = await prisma.forecastTarget.findUnique({
      where: { companyId },
      select: {
        id: true,
        isActive: true,
        minForecastCoins: true,
        maxForecastCoins: true,
        stripeAccountId: true,
        stripeConnectedAt: true,
        currentMrr: true,
        lastMrrUpdate: true,
      },
    });

    if (!forecastTarget) {
      // Create a new forecast target for this company
      forecastTarget = await prisma.forecastTarget.create({
        data: {
          companyId,
          isActive: false,
        },
        select: {
          id: true,
          isActive: true,
          minForecastCoins: true,
          maxForecastCoins: true,
          stripeAccountId: true,
          stripeConnectedAt: true,
          currentMrr: true,
          lastMrrUpdate: true,
        },
      });
    }

    return NextResponse.json({
      ...forecastTarget,
      companyId,
      companyName: company.name,
      hasStripeConnection: !!forecastTarget.stripeAccountId,
    });
  } catch (error) {
    console.error("Error fetching forecasting settings:", error);
    return NextResponse.json(
      { error: "Failed to fetch settings" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/forecasting/settings
 * Update forecasting settings for a company
 */
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { companyId, isActive, minForecastCoins, maxForecastCoins } = body;

    if (!companyId) {
      return NextResponse.json(
        { error: "companyId is required" },
        { status: 400 }
      );
    }

    // Check if user owns the company
    const company = await prisma.company.findUnique({
      where: { id: companyId },
      select: {
        id: true,
        userId: true,
        members: {
          where: {
            userId: session.user.id,
            role: { in: ["OWNER", "ADMIN"] },
          },
        },
      },
    });

    if (!company) {
      return NextResponse.json({ error: "Company not found" }, { status: 404 });
    }

    // Check if user is owner or admin
    const isOwnerOrAdmin =
      company.userId === session.user.id || company.members.length > 0;

    if (!isOwnerOrAdmin) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Get existing forecast target
    const existingTarget = await prisma.forecastTarget.findUnique({
      where: { companyId },
      select: {
        id: true,
        stripeAccountId: true,
      },
    });

    // Can only activate if Stripe is connected
    if (isActive === true && !existingTarget?.stripeAccountId) {
      return NextResponse.json(
        { error: "Connect Stripe before enabling forecasting" },
        { status: 400 }
      );
    }

    // Validate coin limits
    const min = minForecastCoins ?? 10;
    const max = maxForecastCoins ?? 100;

    if (min < 1 || max < min || max > 1000) {
      return NextResponse.json(
        { error: "Invalid coin limits" },
        { status: 400 }
      );
    }

    // Update or create forecast target
    const forecastTarget = await prisma.forecastTarget.upsert({
      where: { companyId },
      create: {
        companyId,
        isActive: isActive ?? false,
        minForecastCoins: min,
        maxForecastCoins: max,
      },
      update: {
        ...(typeof isActive === "boolean" && { isActive }),
        ...(minForecastCoins && { minForecastCoins: min }),
        ...(maxForecastCoins && { maxForecastCoins: max }),
      },
      select: {
        id: true,
        isActive: true,
        minForecastCoins: true,
        maxForecastCoins: true,
        stripeAccountId: true,
        stripeConnectedAt: true,
        currentMrr: true,
        lastMrrUpdate: true,
      },
    });

    return NextResponse.json({
      ...forecastTarget,
      companyId,
      hasStripeConnection: !!forecastTarget.stripeAccountId,
    });
  } catch (error) {
    console.error("Error updating forecasting settings:", error);
    return NextResponse.json(
      { error: "Failed to update settings" },
      { status: 500 }
    );
  }
}
