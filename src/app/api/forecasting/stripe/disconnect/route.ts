import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { disconnectStripe } from "@/lib/stripe-mrr";

/**
 * POST /api/forecasting/stripe/disconnect
 * Disconnect Stripe from a company's forecasting
 */
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { companyId } = body;

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

    // Get forecast target
    const forecastTarget = await prisma.forecastTarget.findUnique({
      where: { companyId },
      select: { id: true },
    });

    if (!forecastTarget) {
      return NextResponse.json(
        { error: "Forecasting not enabled for this company" },
        { status: 404 }
      );
    }

    // Check for pending forecasts
    const pendingForecasts = await prisma.forecast.count({
      where: {
        targetId: forecastTarget.id,
        status: "PENDING",
      },
    });

    if (pendingForecasts > 0) {
      return NextResponse.json(
        {
          error: `Cannot disconnect Stripe with ${pendingForecasts} pending forecasts. Wait for them to resolve first.`,
        },
        { status: 400 }
      );
    }

    // Disconnect Stripe
    await disconnectStripe(forecastTarget.id);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error disconnecting Stripe:", error);
    return NextResponse.json(
      { error: "Failed to disconnect Stripe" },
      { status: 500 }
    );
  }
}
