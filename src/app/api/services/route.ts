import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { ServiceCategory } from "@prisma/client";

// GET /api/services - List active service listings
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category") as ServiceCategory | null;
    const search = searchParams.get("search") || "";
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "12");
    const skip = (page - 1) * limit;

    const now = new Date();
    const andConditions: object[] = [
      { status: "ACTIVE" as const },
      {
        OR: [
          { expiresAt: null },
          { expiresAt: { gt: now } },
        ],
      },
    ];
    if (category) andConditions.push({ category });
    if (search) {
      andConditions.push({
        OR: [
          { title: { contains: search, mode: "insensitive" as const } },
          { description: { contains: search, mode: "insensitive" as const } },
        ],
      });
    }
    const where = { AND: andConditions };

    const [listings, total] = await Promise.all([
      prisma.serviceListing.findMany({
        where,
        orderBy: { activatedAt: "desc" },
        skip,
        take: limit,
        include: {
          user: {
            select: {
              id: true,
              name: true,
              image: true,
              slug: true,
            },
          },
          portfolioProjects: {
            take: 3,
            include: {
              project: {
                select: {
                  id: true,
                  slug: true,
                  title: true,
                  imageUrl: true,
                },
              },
            },
          },
          _count: {
            select: { orders: true },
          },
        },
      }),
      prisma.serviceListing.count({ where }),
    ]);

    return NextResponse.json({
      services: listings,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching services:", error);
    return NextResponse.json(
      { error: "Failed to fetch services" },
      { status: 500 }
    );
  }
}
