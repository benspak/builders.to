import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import {
  spendTokens,
  hasEnoughTokens,
  SERVICE_REDEMPTION_COST,
  getBalance
} from "@/lib/tokens";
import { SERVICE_LISTING_DURATION_DAYS } from "@/lib/stripe";

interface RouteParams {
  params: Promise<{ id: string }>;
}

/**
 * POST /api/services/[id]/redeem
 * Redeem tokens to activate a service listing (instead of paying with Stripe)
 */
export async function POST(request: Request, { params }: RouteParams) {
  try {
    const session = await auth();
    const { id } = await params;

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "You must be signed in to redeem tokens" },
        { status: 401 }
      );
    }

    // Verify the service listing exists and belongs to the user
    const service = await prisma.serviceListing.findUnique({
      where: { id },
    });

    if (!service) {
      return NextResponse.json(
        { error: "Service listing not found" },
        { status: 404 }
      );
    }

    if (service.userId !== session.user.id) {
      return NextResponse.json(
        { error: "You can only redeem tokens for your own listings" },
        { status: 403 }
      );
    }

    // Only allow redemption for DRAFT, EXPIRED, or PENDING_PAYMENT listings
    if (!["DRAFT", "EXPIRED", "PENDING_PAYMENT"].includes(service.status)) {
      return NextResponse.json(
        { error: `Cannot redeem tokens for ${service.status} listing` },
        { status: 400 }
      );
    }

    // Check if user has enough tokens
    const hasTokens = await hasEnoughTokens(session.user.id, SERVICE_REDEMPTION_COST);
    if (!hasTokens) {
      const balance = await getBalance(session.user.id);
      return NextResponse.json(
        {
          error: "Insufficient tokens",
          required: SERVICE_REDEMPTION_COST,
          balance,
        },
        { status: 400 }
      );
    }

    // Spend the tokens
    const { balance, transactionId } = await spendTokens(
      session.user.id,
      SERVICE_REDEMPTION_COST,
      "SERVICE_REDEMPTION",
      `Unlocked service listing: ${service.title}`,
      { serviceId: id, serviceTitle: service.title }
    );

    // Activate the service listing
    const now = new Date();
    const expiresAt = new Date(now);
    expiresAt.setDate(expiresAt.getDate() + SERVICE_LISTING_DURATION_DAYS);

    await prisma.serviceListing.update({
      where: { id },
      data: {
        status: "ACTIVE",
        activatedAt: now,
        expiresAt: expiresAt,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Service listing activated successfully with tokens",
      tokensSpent: SERVICE_REDEMPTION_COST,
      newBalance: balance,
      transactionId,
      service: {
        id: service.id,
        status: "ACTIVE",
        activatedAt: now,
        expiresAt: expiresAt,
      },
    });
  } catch (error) {
    console.error("Error redeeming tokens for service:", error);

    if (error instanceof Error && error.message === "Insufficient token balance") {
      return NextResponse.json(
        { error: "Insufficient tokens" },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Failed to redeem tokens" },
      { status: 500 }
    );
  }
}

/**
 * GET /api/services/[id]/redeem
 * Check if user can redeem tokens for this service listing
 */
export async function GET(request: Request, { params }: RouteParams) {
  try {
    const session = await auth();
    const { id } = await params;

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "You must be signed in" },
        { status: 401 }
      );
    }

    // Verify the service listing exists and belongs to the user
    const service = await prisma.serviceListing.findUnique({
      where: { id },
    });

    if (!service) {
      return NextResponse.json(
        { error: "Service listing not found" },
        { status: 404 }
      );
    }

    if (service.userId !== session.user.id) {
      return NextResponse.json(
        { error: "You can only check your own listings" },
        { status: 403 }
      );
    }

    const balance = await getBalance(session.user.id);
    const canRedeem = balance >= SERVICE_REDEMPTION_COST &&
                      ["DRAFT", "EXPIRED", "PENDING_PAYMENT"].includes(service.status);

    return NextResponse.json({
      canRedeem,
      cost: SERVICE_REDEMPTION_COST,
      balance,
      serviceStatus: service.status,
    });
  } catch (error) {
    console.error("Error checking redemption eligibility:", error);
    return NextResponse.json(
      { error: "Failed to check eligibility" },
      { status: 500 }
    );
  }
}
