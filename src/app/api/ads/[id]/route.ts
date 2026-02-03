import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

interface RouteParams {
  params: Promise<{ id: string }>;
}

// GET /api/ads/[id] - Get a single ad
export async function GET(request: Request, { params }: RouteParams) {
  try {
    const session = await auth();
    const { id } = await params;

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "You must be signed in to view this ad" },
        { status: 401 }
      );
    }

    const ad = await prisma.advertisement.findUnique({
      where: { id },
      include: {
        _count: {
          select: { views: true },
        },
      },
    });

    if (!ad) {
      return NextResponse.json(
        { error: "Ad not found" },
        { status: 404 }
      );
    }

    // Only allow owner to view their ad
    if (ad.userId !== session.user.id) {
      return NextResponse.json(
        { error: "You can only view your own ads" },
        { status: 403 }
      );
    }

    return NextResponse.json(ad);
  } catch (error) {
    console.error("Error fetching ad:", error);
    return NextResponse.json(
      { error: "Failed to fetch ad" },
      { status: 500 }
    );
  }
}

// PUT /api/ads/[id] - Update an ad
export async function PUT(request: Request, { params }: RouteParams) {
  try {
    const session = await auth();
    const { id } = await params;

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "You must be signed in to update an ad" },
        { status: 401 }
      );
    }

    const existingAd = await prisma.advertisement.findUnique({
      where: { id },
    });

    if (!existingAd) {
      return NextResponse.json(
        { error: "Ad not found" },
        { status: 404 }
      );
    }

    if (existingAd.userId !== session.user.id) {
      return NextResponse.json(
        { error: "You can only update your own ads" },
        { status: 403 }
      );
    }

    // Allow editing if:
    // 1. Ad is DRAFT or PENDING_PAYMENT (not yet paid)
    // 2. Ad is ACTIVE and still within the paid period (endDate hasn't passed)
    // 3. Ad is EXPIRED but still within the original paid period (endDate hasn't passed)
    const now = new Date();
    const isWithinPaidPeriod = existingAd.endDate && existingAd.endDate > now;
    const canEdit =
      existingAd.status === "DRAFT" ||
      existingAd.status === "PENDING_PAYMENT" ||
      ((existingAd.status === "ACTIVE" || existingAd.status === "EXPIRED") && isWithinPaidPeriod);

    if (!canEdit) {
      return NextResponse.json(
        { error: "Cannot edit an ad whose paid period has expired. Please purchase a new ad slot." },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { title, description, imageUrl, linkUrl, ctaText } = body;

    // Validation
    if (title !== undefined && (typeof title !== "string" || title.trim().length === 0)) {
      return NextResponse.json(
        { error: "Title cannot be empty" },
        { status: 400 }
      );
    }

    if (linkUrl !== undefined) {
      if (typeof linkUrl !== "string" || linkUrl.trim().length === 0) {
        return NextResponse.json(
          { error: "Link URL cannot be empty" },
          { status: 400 }
        );
      }
      try {
        new URL(linkUrl);
      } catch {
        return NextResponse.json(
          { error: "Invalid link URL format" },
          { status: 400 }
        );
      }
    }

    const updatedAd = await prisma.advertisement.update({
      where: { id },
      data: {
        ...(title !== undefined && { title: title.trim() }),
        ...(description !== undefined && { description: description?.trim() || null }),
        ...(imageUrl !== undefined && { imageUrl: imageUrl?.trim() || null }),
        ...(linkUrl !== undefined && { linkUrl: linkUrl.trim() }),
        ...(ctaText !== undefined && { ctaText: ctaText?.trim() || "Learn More" }),
      },
    });

    return NextResponse.json(updatedAd);
  } catch (error) {
    console.error("Error updating ad:", error);
    return NextResponse.json(
      { error: "Failed to update ad" },
      { status: 500 }
    );
  }
}

// DELETE /api/ads/[id] - Delete an ad
export async function DELETE(request: Request, { params }: RouteParams) {
  try {
    const session = await auth();
    const { id } = await params;

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "You must be signed in to delete an ad" },
        { status: 401 }
      );
    }

    const existingAd = await prisma.advertisement.findUnique({
      where: { id },
    });

    if (!existingAd) {
      return NextResponse.json(
        { error: "Ad not found" },
        { status: 404 }
      );
    }

    if (existingAd.userId !== session.user.id) {
      return NextResponse.json(
        { error: "You can only delete your own ads" },
        { status: 403 }
      );
    }

    const now = new Date();
    const isWithinPaidPeriod = existingAd.endDate && existingAd.endDate > now;

    // For unpaid ads (DRAFT, PENDING_PAYMENT), delete entirely
    if (existingAd.status === "DRAFT" || existingAd.status === "PENDING_PAYMENT") {
      await prisma.advertisement.delete({
        where: { id },
      });
      return NextResponse.json({ success: true });
    }

    // For ACTIVE ads within paid period, clear the content but keep the slot
    // This allows users to create a new ad on the same purchased slot
    if (existingAd.status === "ACTIVE" && isWithinPaidPeriod) {
      await prisma.advertisement.update({
        where: { id },
        data: {
          title: "[Ad Removed]",
          description: null,
          imageUrl: null,
          linkUrl: "https://builders.to",
          ctaText: "Learn More",
          // Keep status as ACTIVE so slot remains reserved until endDate
        },
      });
      return NextResponse.json({ success: true, cleared: true });
    }

    // For EXPIRED ads or ads past their paid period, delete entirely
    if (existingAd.status === "EXPIRED" || !isWithinPaidPeriod) {
      await prisma.advertisement.delete({
        where: { id },
      });
      return NextResponse.json({ success: true });
    }

    // CANCELLED ads can be deleted
    if (existingAd.status === "CANCELLED") {
      await prisma.advertisement.delete({
        where: { id },
      });
      return NextResponse.json({ success: true });
    }

    return NextResponse.json(
      { error: "Cannot delete this ad" },
      { status: 400 }
    );
  } catch (error) {
    console.error("Error deleting ad:", error);
    return NextResponse.json(
      { error: "Failed to delete ad" },
      { status: 500 }
    );
  }
}
