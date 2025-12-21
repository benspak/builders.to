import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { CompanyCategory, CompanySize } from "@prisma/client";
import { generateSlug, generateUniqueSlug, validateImageUrl } from "@/lib/utils";

// GET /api/companies - List all companies
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category") as CompanyCategory | null;
    const size = searchParams.get("size") as CompanySize | null;
    const search = searchParams.get("search") || "";
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "12");
    const skip = (page - 1) * limit;

    const where = {
      ...(category && { category }),
      ...(size && { size }),
      ...(search && {
        OR: [
          { name: { contains: search, mode: "insensitive" as const } },
          { about: { contains: search, mode: "insensitive" as const } },
          { location: { contains: search, mode: "insensitive" as const } },
        ],
      }),
    };

    const [companies, total] = await Promise.all([
      prisma.company.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
        include: {
          user: {
            select: {
              id: true,
              name: true,
              image: true,
            },
          },
          _count: {
            select: {
              projects: true,
            },
          },
        },
      }),
      prisma.company.count({ where }),
    ]);

    return NextResponse.json({
      companies,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching companies:", error);
    return NextResponse.json(
      { error: "Failed to fetch companies" },
      { status: 500 }
    );
  }
}

// POST /api/companies - Create a new company
export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { name, logo, location, category, about, website, size, yearFounded, slug } = body;

    if (!name) {
      return NextResponse.json(
        { error: "Company name is required" },
        { status: 400 }
      );
    }

    // Validate logo URL
    const logoError = validateImageUrl(logo);
    if (logoError) {
      return NextResponse.json(
        { error: logoError },
        { status: 400 }
      );
    }

    // Generate or validate slug
    let finalSlug = slug ? generateSlug(slug) : generateSlug(name);

    // Check if slug already exists
    const existingCompany = await prisma.company.findUnique({
      where: { slug: finalSlug },
    });

    if (existingCompany) {
      // If user provided a custom slug that exists, return error
      if (slug) {
        return NextResponse.json(
          { error: "This URL slug is already taken. Please choose a different one." },
          { status: 400 }
        );
      }
      // If auto-generated slug exists, add a random suffix
      finalSlug = generateUniqueSlug(name);
    }

    const company = await prisma.company.create({
      data: {
        name,
        slug: finalSlug,
        logo,
        location,
        category: category || "OTHER",
        about,
        website,
        size,
        yearFounded: yearFounded ? parseInt(yearFounded) : null,
        userId: session.user.id,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
        _count: {
          select: {
            projects: true,
          },
        },
      },
    });

    return NextResponse.json(company, { status: 201 });
  } catch (error) {
    console.error("Error creating company:", error);
    return NextResponse.json(
      { error: "Failed to create company" },
      { status: 500 }
    );
  }
}
