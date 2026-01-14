import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getStripeOAuthUrl } from "@/lib/stripe-mrr";

/**
 * POST /api/forecasting/stripe/connect
 * Initiate Stripe OAuth connection for a company
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

    // Ensure forecast target exists
    await prisma.forecastTarget.upsert({
      where: { companyId },
      create: { companyId },
      update: {},
    });

    // Generate OAuth URL
    const baseUrl = process.env.NEXTAUTH_URL || "http://localhost:3000";
    const redirectUri = `${baseUrl}/api/forecasting/stripe/callback`;

    const authUrl = getStripeOAuthUrl(companyId, redirectUri);

    return NextResponse.json({ url: authUrl });
  } catch (error) {
    console.error("Error initiating Stripe OAuth:", error);
    return NextResponse.json(
      { error: "Failed to initiate Stripe connection" },
      { status: 500 }
    );
  }
}
