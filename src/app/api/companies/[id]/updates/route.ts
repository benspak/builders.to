import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { rateLimit, RATE_LIMITS, rateLimitResponse } from "@/lib/rate-limit";

interface RouteParams {
  params: Promise<{ id: string }>;
}

// GET /api/companies/[id]/updates - List company updates
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const skip = (page - 1) * limit;

    // Verify company exists
    const company = await prisma.company.findUnique({
      where: { id },
      select: { id: true },
    });

    if (!company) {
      return NextResponse.json(
        { error: "Company not found" },
        { status: 404 }
      );
    }

    const [updates, total] = await Promise.all([
      prisma.companyUpdate.findMany({
        where: { companyId: id },
        orderBy: [
          { isPinned: "desc" },
          { createdAt: "desc" },
        ],
        skip,
        take: limit,
      }),
      prisma.companyUpdate.count({ where: { companyId: id } }),
    ]);

    return NextResponse.json({
      updates,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching company updates:", error);
    return NextResponse.json(
      { error: "Failed to fetch updates" },
      { status: 500 }
    );
  }
}

// POST /api/companies/[id]/updates - Create a new update
export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    // Rate limit check
    const { success, reset } = rateLimit(request, RATE_LIMITS.createUpdate);
    if (!success) {
      return rateLimitResponse(reset);
    }

    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { id } = await params;

    // Verify company exists
    const company = await prisma.company.findUnique({
      where: { id },
      select: { userId: true },
    });

    if (!company) {
      return NextResponse.json(
        { error: "Company not found" },
        { status: 404 }
      );
    }

    // Check if user is owner or a member of the company
    const isMember = await prisma.companyMember.findUnique({
      where: {
        companyId_userId: { companyId: id, userId: session.user.id },
      },
    });

    if (company.userId !== session.user.id && !isMember) {
      return NextResponse.json(
        { error: "You don't have permission to post updates for this company" },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { content, imageUrl, isPinned } = body;

    if (!content || content.trim().length === 0) {
      return NextResponse.json(
        { error: "Update content is required" },
        { status: 400 }
      );
    }

    if (content.length > 5000) {
      return NextResponse.json(
        { error: "Update content must be 5000 characters or less" },
        { status: 400 }
      );
    }

    const update = await prisma.companyUpdate.create({
      data: {
        content: content.trim(),
        imageUrl: imageUrl || null,
        isPinned: isPinned || false,
        companyId: id,
        authorId: session.user.id,
      },
    });

    return NextResponse.json(update, { status: 201 });
  } catch (error) {
    console.error("Error creating company update:", error);
    return NextResponse.json(
      { error: "Failed to create update" },
      { status: 500 }
    );
  }
}
