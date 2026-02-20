import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { rateLimit, RATE_LIMITS, rateLimitResponse } from "@/lib/rate-limit";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { success, reset } = rateLimit(request, RATE_LIMITS.action);
    if (!success) return rateLimitResponse(reset);

    const { id } = await params;

    const discount = await prisma.discount.findUnique({
      where: { id },
      select: {
        id: true,
        isActive: true,
        expiresAt: true,
        maxUses: true,
        claimCount: true,
        couponCode: true,
        discountUrl: true,
      },
    });

    if (!discount) {
      return NextResponse.json(
        { error: "Discount not found" },
        { status: 404 }
      );
    }

    if (!discount.isActive) {
      return NextResponse.json(
        { error: "This discount is no longer active" },
        { status: 410 }
      );
    }

    if (discount.expiresAt && discount.expiresAt < new Date()) {
      return NextResponse.json(
        { error: "This discount has expired" },
        { status: 410 }
      );
    }

    if (discount.maxUses && discount.claimCount >= discount.maxUses) {
      return NextResponse.json(
        { error: "This discount has reached its maximum number of claims" },
        { status: 410 }
      );
    }

    const existingClaim = await prisma.discountClaim.findUnique({
      where: {
        discountId_userId: {
          discountId: id,
          userId: session.user.id,
        },
      },
    });

    if (existingClaim) {
      return NextResponse.json({
        couponCode: discount.couponCode,
        discountUrl: discount.discountUrl,
        alreadyClaimed: true,
      });
    }

    await prisma.$transaction([
      prisma.discountClaim.create({
        data: {
          discountId: id,
          userId: session.user.id,
        },
      }),
      prisma.discount.update({
        where: { id },
        data: { claimCount: { increment: 1 } },
      }),
    ]);

    return NextResponse.json({
      couponCode: discount.couponCode,
      discountUrl: discount.discountUrl,
      alreadyClaimed: false,
    });
  } catch (error) {
    console.error("Error claiming discount:", error);
    return NextResponse.json(
      { error: "Failed to claim discount" },
      { status: 500 }
    );
  }
}
