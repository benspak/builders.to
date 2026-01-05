import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET /api/ads - List current user's ads
export async function GET() {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "You must be signed in to view your ads" },
        { status: 401 }
      );
    }

    const ads = await prisma.advertisement.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: "desc" },
      include: {
        _count: {
          select: { views: true },
        },
      },
    });

    return NextResponse.json(ads);
  } catch (error) {
    console.error("Error fetching ads:", error);
    return NextResponse.json(
      { error: "Failed to fetch ads" },
      { status: 500 }
    );
  }
}

// POST /api/ads - Create a new ad (draft)
export async function POST(request: Request) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "You must be signed in to create an ad" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { title, description, imageUrl, linkUrl, ctaText } = body;

    // Validation
    if (!title || typeof title !== "string" || title.trim().length === 0) {
      return NextResponse.json(
        { error: "Title is required" },
        { status: 400 }
      );
    }

    if (!linkUrl || typeof linkUrl !== "string" || linkUrl.trim().length === 0) {
      return NextResponse.json(
        { error: "Link URL is required" },
        { status: 400 }
      );
    }

    // Validate URL format
    try {
      new URL(linkUrl);
    } catch {
      return NextResponse.json(
        { error: "Invalid link URL format" },
        { status: 400 }
      );
    }

    const ad = await prisma.advertisement.create({
      data: {
        userId: session.user.id,
        title: title.trim(),
        description: description?.trim() || null,
        imageUrl: imageUrl?.trim() || null,
        linkUrl: linkUrl.trim(),
        ctaText: ctaText?.trim() || "Learn More",
        status: "DRAFT",
      },
    });

    return NextResponse.json(ad, { status: 201 });
  } catch (error) {
    console.error("Error creating ad:", error);
    return NextResponse.json(
      { error: "Failed to create ad" },
      { status: 500 }
    );
  }
}
