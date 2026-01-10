import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { LocalListingCategory, LocalListingStatus } from "@prisma/client";
import { generateSlug, generateUniqueSlug, generateLocationSlug } from "@/lib/utils";
import { rateLimit, RATE_LIMITS, rateLimitResponse } from "@/lib/rate-limit";

// Duration in days for different categories
const LISTING_DURATION = {
  SERVICES: 90, // Paid listings last 90 days
  FREE: 30, // Free listings last 30 days
};

/**
 * GET /api/local-listings
 * List local listings with optional filters
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category") as LocalListingCategory | null;
    const locationSlug = searchParams.get("locationSlug");
    const search = searchParams.get("search") || "";
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const skip = (page - 1) * limit;
    const mine = searchParams.get("mine") === "true";
    const status = searchParams.get("status") as LocalListingStatus | null;

    // If filtering by "mine", get the current user's ID
    let currentUserId: string | null = null;
    if (mine) {
      const session = await auth();
      currentUserId = session?.user?.id || null;
      if (!currentUserId) {
        return NextResponse.json({
          listings: [],
          pagination: { page: 1, limit, total: 0, totalPages: 0 },
        });
      }
    }

    // Build the where clause
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const where: any = {};

    if (mine && currentUserId) {
      where.userId = currentUserId;
      // When viewing own listings, optionally filter by status
      if (status) {
        where.status = status;
      }
    } else {
      // Public view: only show active, non-expired listings
      where.status = "ACTIVE";
      where.OR = [
        { expiresAt: null },
        { expiresAt: { gt: new Date() } },
      ];
    }

    if (category) {
      where.category = category;
    }

    if (locationSlug) {
      where.locationSlug = locationSlug;
    }

    if (search) {
      where.AND = [
        ...(where.AND || []),
        {
          OR: [
            { title: { contains: search, mode: "insensitive" } },
            { description: { contains: search, mode: "insensitive" } },
          ],
        },
      ];
    }

    const [listings, total] = await Promise.all([
      prisma.localListing.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
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
          images: {
            orderBy: { order: "asc" },
            take: 3,
          },
          _count: {
            select: {
              comments: true,
              flags: true,
            },
          },
        },
      }),
      prisma.localListing.count({ where }),
    ]);

    return NextResponse.json({
      listings,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching local listings:", error);
    return NextResponse.json(
      { error: "Failed to fetch listings" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/local-listings
 * Create a new local listing
 */
export async function POST(request: NextRequest) {
  try {
    // Rate limit check
    const { success, reset } = rateLimit(request, RATE_LIMITS.createProject);
    if (!success) {
      return rateLimitResponse(reset);
    }

    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "You must be signed in to create a listing" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const {
      title,
      description,
      category,
      locationSlug: customLocationSlug,
      city: customCity,
      state: customState,
      zipCode,
      contactEmail,
      contactPhone,
      priceInCents, // For SERVICES category
      images,
    } = body;

    // Validate required fields
    if (!title || !description || !category) {
      return NextResponse.json(
        { error: "Title, description, and category are required" },
        { status: 400 }
      );
    }

    // Validate category
    const validCategories = Object.values(LocalListingCategory);
    if (!validCategories.includes(category)) {
      return NextResponse.json(
        { error: "Invalid category" },
        { status: 400 }
      );
    }

    // Get user's location if not provided
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        city: true,
        state: true,
        locationSlug: true,
        zipCode: true,
        email: true,
      },
    });

    // Determine location to use
    let finalCity = customCity || user?.city;
    let finalState = customState || user?.state;
    let finalLocationSlug = customLocationSlug || user?.locationSlug;
    const finalZipCode = zipCode || user?.zipCode;

    // If custom location provided but no slug, generate it
    if (customCity && customState && !customLocationSlug) {
      finalLocationSlug = generateLocationSlug(`${customCity}, ${customState}`);
    }

    // Require location
    if (!finalCity || !finalState || !finalLocationSlug) {
      return NextResponse.json(
        { error: "Location is required. Please set your location in settings or provide one for this listing." },
        { status: 400 }
      );
    }

    // Generate slug
    let slug = generateSlug(title);
    const existingSlug = await prisma.localListing.findUnique({
      where: { slug },
    });
    if (existingSlug) {
      slug = generateUniqueSlug(title);
    }

    // Determine initial status based on category
    // SERVICES requires payment, so it starts as DRAFT
    // Other categories go straight to ACTIVE
    const isPaidCategory = category === "SERVICES";
    const initialStatus = isPaidCategory ? "DRAFT" : "ACTIVE";

    // Calculate expiration for free categories
    let activatedAt: Date | null = null;
    let expiresAt: Date | null = null;

    if (!isPaidCategory) {
      activatedAt = new Date();
      expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + LISTING_DURATION.FREE);
    }

    // Create the listing
    const listing = await prisma.localListing.create({
      data: {
        slug,
        title,
        description,
        category,
        status: initialStatus,
        locationSlug: finalLocationSlug,
        city: finalCity,
        state: finalState,
        zipCode: finalZipCode,
        contactEmail: contactEmail || user?.email,
        contactPhone,
        priceInCents: isPaidCategory ? priceInCents : null,
        activatedAt,
        expiresAt,
        userId: session.user.id,
        images: images?.length
          ? {
              create: images.map((img: { url: string; caption?: string }, index: number) => ({
                url: img.url,
                caption: img.caption,
                order: index,
              })),
            }
          : undefined,
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
        images: {
          orderBy: { order: "asc" },
        },
      },
    });

    return NextResponse.json(listing, { status: 201 });
  } catch (error) {
    console.error("Error creating local listing:", error);
    return NextResponse.json(
      { error: "Failed to create listing" },
      { status: 500 }
    );
  }
}
