import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { MIN_LAUNCHED_PROJECTS_FOR_LISTING } from "@/lib/stripe";

/**
 * GET /api/services
 * List all active services (public) or user's services (with auth)
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const category = searchParams.get("category");
    const sellerId = searchParams.get("sellerId");
    const mine = searchParams.get("mine") === "true";
    const limit = parseInt(searchParams.get("limit") || "20");
    const cursor = searchParams.get("cursor");

    const session = await auth();

    // Build where clause
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const where: any = {};

    if (mine && session?.user?.id) {
      // Get user's own listings (any status)
      where.userId = session.user.id;
    } else if (sellerId) {
      // Get specific seller's active listings
      where.userId = sellerId;
      where.status = "ACTIVE";
      where.expiresAt = { gt: new Date() };
    } else {
      // Public: only active, non-expired listings
      where.status = "ACTIVE";
      where.expiresAt = { gt: new Date() };
    }

    if (category) {
      where.category = category;
    }

    const services = await prisma.serviceListing.findMany({
      where,
      take: limit + 1, // Get one extra to check if there are more
      ...(cursor && { cursor: { id: cursor }, skip: 1 }),
      orderBy: { createdAt: "desc" },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            displayName: true,
            firstName: true,
            lastName: true,
            image: true,
            slug: true,
            headline: true,
            _count: {
              select: {
                projects: { where: { status: "LAUNCHED" } },
              },
            },
          },
        },
        portfolioProjects: {
          include: {
            project: {
              select: {
                id: true,
                title: true,
                slug: true,
                imageUrl: true,
                status: true,
                _count: {
                  select: { upvotes: true },
                },
              },
            },
          },
        },
        _count: {
          select: { orders: true },
        },
      },
    });

    const hasMore = services.length > limit;
    const items = hasMore ? services.slice(0, -1) : services;
    const nextCursor = hasMore ? items[items.length - 1]?.id : null;

    return NextResponse.json({
      services: items,
      nextCursor,
      hasMore,
    });
  } catch (error) {
    console.error("Error fetching services:", error);
    return NextResponse.json(
      { error: "Failed to fetch services" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/services
 * Create a new service listing
 */
export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "You must be signed in to create a service listing" },
        { status: 401 }
      );
    }

    // Check eligibility
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        stripeConnectOnboarded: true,
        _count: {
          select: {
            projects: { where: { status: "LAUNCHED" } },
          },
        },
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    if (user._count.projects < MIN_LAUNCHED_PROJECTS_FOR_LISTING) {
      return NextResponse.json(
        { error: `You need at least ${MIN_LAUNCHED_PROJECTS_FOR_LISTING} launched projects to sell services` },
        { status: 403 }
      );
    }

    if (!user.stripeConnectOnboarded) {
      return NextResponse.json(
        { error: "You must complete Stripe Connect onboarding first" },
        { status: 403 }
      );
    }

    const body = await request.json();
    const {
      title,
      description,
      category,
      priceInCents,
      deliveryDays,
      portfolioProjectIds,
    } = body;

    // Validate required fields
    if (!title || !description || !category || !priceInCents || !deliveryDays) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Validate price (minimum $10)
    if (priceInCents < 1000) {
      return NextResponse.json(
        { error: "Minimum price is $10" },
        { status: 400 }
      );
    }

    // Validate delivery days
    if (deliveryDays < 1 || deliveryDays > 365) {
      return NextResponse.json(
        { error: "Delivery days must be between 1 and 365" },
        { status: 400 }
      );
    }

    // Generate slug
    const baseSlug = title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");

    // Check for existing slugs and add suffix if needed
    let slug = baseSlug;
    let counter = 1;
    while (await prisma.serviceListing.findUnique({ where: { slug } })) {
      slug = `${baseSlug}-${counter}`;
      counter++;
    }

    // Create the service listing
    const service = await prisma.serviceListing.create({
      data: {
        title,
        description,
        category,
        priceInCents,
        deliveryDays,
        slug,
        status: "DRAFT", // Will be set to PENDING_PAYMENT when checkout starts
        userId: session.user.id,
        portfolioProjects: portfolioProjectIds?.length
          ? {
              create: portfolioProjectIds.map((projectId: string) => ({
                projectId,
              })),
            }
          : undefined,
      },
      include: {
        portfolioProjects: {
          include: {
            project: {
              select: {
                id: true,
                title: true,
                slug: true,
              },
            },
          },
        },
      },
    });

    return NextResponse.json(service, { status: 201 });
  } catch (error) {
    console.error("Error creating service:", error);
    return NextResponse.json(
      { error: "Failed to create service listing" },
      { status: 500 }
    );
  }
}
