import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { RoleType, RoleCategory } from "@prisma/client";
import { rateLimit, RATE_LIMITS, rateLimitResponse } from "@/lib/rate-limit";

interface RouteParams {
  params: Promise<{ id: string }>;
}

// GET /api/companies/[id]/roles - List company roles
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const skip = (page - 1) * limit;
    const activeOnly = searchParams.get("active") !== "false";
    const type = searchParams.get("type") as RoleType | null;
    const category = searchParams.get("category") as RoleCategory | null;

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

    const where = {
      companyId: id,
      ...(activeOnly && { isActive: true }),
      ...(type && { type }),
      ...(category && { category }),
    };

    const [roles, total] = await Promise.all([
      prisma.companyRole.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.companyRole.count({ where }),
    ]);

    return NextResponse.json({
      roles,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching company roles:", error);
    return NextResponse.json(
      { error: "Failed to fetch roles" },
      { status: 500 }
    );
  }
}

// POST /api/companies/[id]/roles - Create a new role
export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    // Rate limit check
    const { success, reset } = rateLimit(request, RATE_LIMITS.createCompany); // Reuse company rate limit
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

    // Verify company ownership
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

    if (company.userId !== session.user.id) {
      return NextResponse.json(
        { error: "You don't have permission to post roles for this company" },
        { status: 403 }
      );
    }

    const body = await request.json();
    const {
      title,
      description,
      type,
      category,
      location,
      isRemote,
      timezone,
      compensationType,
      salaryMin,
      salaryMax,
      currency,
      equityMin,
      equityMax,
      skills,
      experienceMin,
      experienceMax,
      applicationUrl,
      applicationEmail,
      expiresAt,
    } = body;

    if (!title || title.trim().length === 0) {
      return NextResponse.json(
        { error: "Role title is required" },
        { status: 400 }
      );
    }

    if (title.length > 100) {
      return NextResponse.json(
        { error: "Role title must be 100 characters or less" },
        { status: 400 }
      );
    }

    // Validate salary range if provided
    if (salaryMin !== undefined && salaryMax !== undefined) {
      if (salaryMin > salaryMax) {
        return NextResponse.json(
          { error: "Minimum salary cannot be greater than maximum salary" },
          { status: 400 }
        );
      }
    }

    // Validate equity range if provided
    if (equityMin !== undefined && equityMax !== undefined) {
      if (equityMin > equityMax) {
        return NextResponse.json(
          { error: "Minimum equity cannot be greater than maximum equity" },
          { status: 400 }
        );
      }
    }

    // Get company details for the feed event
    const companyDetails = await prisma.company.findUnique({
      where: { id },
      select: { name: true, userId: true },
    });

    const role = await prisma.companyRole.create({
      data: {
        title: title.trim(),
        description: description?.trim() || null,
        type: type || "FULL_TIME",
        category: category || "ENGINEERING",
        location: location?.trim() || null,
        isRemote: isRemote || false,
        timezone: timezone?.trim() || null,
        compensationType: compensationType || null,
        salaryMin: salaryMin !== undefined ? parseInt(salaryMin) : null,
        salaryMax: salaryMax !== undefined ? parseInt(salaryMax) : null,
        currency: currency || "USD",
        equityMin: equityMin !== undefined ? parseFloat(equityMin) : null,
        equityMax: equityMax !== undefined ? parseFloat(equityMax) : null,
        skills: skills || [],
        experienceMin: experienceMin !== undefined ? parseInt(experienceMin) : null,
        experienceMax: experienceMax !== undefined ? parseInt(experienceMax) : null,
        applicationUrl: applicationUrl?.trim() || null,
        applicationEmail: applicationEmail?.trim() || null,
        expiresAt: expiresAt ? new Date(expiresAt) : null,
        companyId: id,
        isActive: true,
      },
    });

    // Create a feed event for the new job posting
    await prisma.feedEvent.create({
      data: {
        type: "JOB_POSTED",
        userId: session.user.id,
        companyRoleId: role.id,
        title: title.trim(),
        description: companyDetails?.name ? `${companyDetails.name} is hiring` : "New job posted",
      },
    });

    return NextResponse.json(role, { status: 201 });
  } catch (error) {
    console.error("Error creating company role:", error);
    return NextResponse.json(
      { error: "Failed to create role" },
      { status: 500 }
    );
  }
}
