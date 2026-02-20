import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { DiscountType } from "@prisma/client";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const discount = await prisma.discount.findFirst({
      where: {
        OR: [{ id }, { slug: id }],
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            displayName: true,
            image: true,
            slug: true,
            headline: true,
          },
        },
        _count: { select: { claims: true } },
      },
    });

    if (!discount) {
      return NextResponse.json(
        { error: "Discount not found" },
        { status: 404 }
      );
    }

    const session = await auth();
    let hasClaimed = false;
    if (session?.user?.id) {
      const claim = await prisma.discountClaim.findUnique({
        where: {
          discountId_userId: {
            discountId: discount.id,
            userId: session.user.id,
          },
        },
      });
      hasClaimed = !!claim;
    }

    const isOwner = session?.user?.id === discount.userId;

    return NextResponse.json({
      discount: {
        ...discount,
        couponCode:
          hasClaimed || isOwner ? discount.couponCode : null,
        discountUrl:
          hasClaimed || isOwner ? discount.discountUrl : null,
      },
      hasClaimed,
      isOwner,
      isAuthenticated: !!session?.user?.id,
    });
  } catch (error) {
    console.error("Error fetching discount:", error);
    return NextResponse.json(
      { error: "Failed to fetch discount" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const discount = await prisma.discount.findUnique({
      where: { id },
      select: { userId: true },
    });

    if (!discount) {
      return NextResponse.json(
        { error: "Discount not found" },
        { status: 404 }
      );
    }

    if (discount.userId !== session.user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await request.json();
    const {
      title,
      description,
      productName,
      productUrl,
      discountType,
      discountValue,
      couponCode,
      discountUrl,
      maxUses,
      expiresAt,
      isActive,
    } = body;

    const updated = await prisma.discount.update({
      where: { id },
      data: {
        ...(title !== undefined && { title }),
        ...(description !== undefined && { description }),
        ...(productName !== undefined && { productName }),
        ...(productUrl !== undefined && { productUrl }),
        ...(discountType !== undefined && {
          discountType: discountType as DiscountType,
        }),
        ...(discountValue !== undefined && { discountValue }),
        ...(couponCode !== undefined && { couponCode: couponCode || null }),
        ...(discountUrl !== undefined && { discountUrl: discountUrl || null }),
        ...(maxUses !== undefined && {
          maxUses: maxUses ? parseInt(maxUses) : null,
        }),
        ...(expiresAt !== undefined && {
          expiresAt: expiresAt ? new Date(expiresAt) : null,
        }),
        ...(isActive !== undefined && { isActive }),
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            displayName: true,
            image: true,
            slug: true,
          },
        },
      },
    });

    return NextResponse.json({ discount: updated });
  } catch (error) {
    console.error("Error updating discount:", error);
    return NextResponse.json(
      { error: "Failed to update discount" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const discount = await prisma.discount.findUnique({
      where: { id },
      select: { userId: true },
    });

    if (!discount) {
      return NextResponse.json(
        { error: "Discount not found" },
        { status: 404 }
      );
    }

    if (discount.userId !== session.user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    await prisma.discount.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting discount:", error);
    return NextResponse.json(
      { error: "Failed to delete discount" },
      { status: 500 }
    );
  }
}
