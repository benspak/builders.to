import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { LocalListingCategory, LocalListingStatus } from "@prisma/client";
import { generateSlug, generateUniqueSlug, generateLocationSlug } from "@/lib/utils";
import { rateLimit, RATE_LIMITS, rateLimitResponse } from "@/lib/rate-limit";
import { MIN_LAUNCHED_PROJECTS_FOR_LISTING } from "@/lib/stripe";

// Duration in days for different categories
const LISTING_DURATION = {
  PAID: 90, // Paid listings (SERVICES, FOR_SALE) last 90 days
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
      priceInCents, // For SERVICES and FOR_SALE categories
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

    // Get user's location and launched project count
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        city: true,
        state: true,
        locationSlug: true,
        zipCode: true,
        email: true,
        _count: {
          select: {
            projects: { where: { status: "LAUNCHED" } },
          },
        },
      },
    });

    // Check if user has at least 1 launched project
    if (!user || user._count.projects < MIN_LAUNCHED_PROJECTS_FOR_LISTING) {
      return NextResponse.json(
        { 
          error: `You need at least ${MIN_LAUNCHED_PROJECTS_FOR_LISTING} launched project to post on Local`,
          launchedProjects: user?._count.projects || 0,
          required: MIN_LAUNCHED_PROJECTS_FOR_LISTING,
        },
        { status: 403 }
      );
    }

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
    // SERVICES and FOR_SALE require payment, so they start as DRAFT
    // Other categories go straight to ACTIVE
    const isPaidCategory = category === "SERVICES" || category === "FOR_SALE";
    const initialStatus = isPaidCategory ? "DRAFT" : "ACTIVE";

    // FOR_SALE requires a price
    if (category === "FOR_SALE" && (!priceInCents || priceInCents < 100)) {
      return NextResponse.json(
        { error: "For sale items must have a price of at least $1.00" },
        { status: 400 }
      );
    }

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

    // Create a feed event for active listings (free categories)
    if (initialStatus === "ACTIVE") {
      await prisma.feedEvent.create({
        data: {
          type: "LISTING_CREATED",
          userId: session.user.id,
          localListingId: listing.id,
          title: title,
          description: description.slice(0, 200),
        },
      });
    }

    return NextResponse.json(listing, { status: 201 });
  } catch (error) {
    console.error("Error creating local listing:", error);
    return NextResponse.json(
      { error: "Failed to create listing" },
      { status: 500 }
    );
  }
}
