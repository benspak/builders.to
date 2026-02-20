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
    const body = await request.json();
    const { reason } = body;

    if (!reason || reason.trim().length === 0) {
      return NextResponse.json(
        { error: "A reason is required" },
        { status: 400 }
      );
    }

    const discount = await prisma.discount.findUnique({
      where: { id },
      select: { id: true, userId: true },
    });

    if (!discount) {
      return NextResponse.json(
        { error: "Discount not found" },
        { status: 404 }
      );
    }

    if (discount.userId === session.user.id) {
      return NextResponse.json(
        { error: "You cannot report your own discount" },
        { status: 400 }
      );
    }

    const existingReport = await prisma.discountReport.findUnique({
      where: {
        discountId_userId: {
          discountId: id,
          userId: session.user.id,
        },
      },
    });

    if (existingReport) {
      return NextResponse.json(
        { error: "You have already reported this discount" },
        { status: 409 }
      );
    }

    await prisma.discountReport.create({
      data: {
        discountId: id,
        userId: session.user.id,
        reason: reason.trim(),
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error reporting discount:", error);
    return NextResponse.json(
      { error: "Failed to report discount" },
      { status: 500 }
    );
  }
}
