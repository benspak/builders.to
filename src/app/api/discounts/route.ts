import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { DiscountType } from "@prisma/client";
import { generateUniqueSlug } from "@/lib/utils";
import { rateLimit, RATE_LIMITS, rateLimitResponse } from "@/lib/rate-limit";
import { isProMember } from "@/lib/stripe-subscription";

const FREE_DISCOUNT_LIMIT = 2;

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search") || "";
    const type = searchParams.get("type") as DiscountType | null;
    const sort = searchParams.get("sort") || "recent";
    const mine = searchParams.get("mine") === "true";
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "12");
    const skip = (page - 1) * limit;

    const now = new Date();
    const where = {
      ...(mine
        ? { userId: session.user.id }
        : {
            isActive: true,
            OR: [{ expiresAt: null }, { expiresAt: { gt: now } }],
          }),
      ...(type && { discountType: type }),
      ...(search && {
        AND: [
          {
            OR: [
              { title: { contains: search, mode: "insensitive" as const } },
              {
                productName: {
                  contains: search,
                  mode: "insensitive" as const,
                },
              },
              {
                description: {
                  contains: search,
                  mode: "insensitive" as const,
                },
              },
            ],
          },
        ],
      }),
    };

    const orderBy =
      sort === "popular"
        ? { claimCount: "desc" as const }
        : sort === "expiring"
          ? { expiresAt: "asc" as const }
          : { createdAt: "desc" as const };

    const [discounts, total] = await Promise.all([
      prisma.discount.findMany({
        where,
        orderBy,
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
          _count: { select: { claims: true } },
        },
      }),
      prisma.discount.count({ where }),
    ]);

    return NextResponse.json({
      discounts,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    console.error("Error fetching discounts:", error);
    return NextResponse.json(
      { error: "Failed to fetch discounts" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { success, reset } = rateLimit(request, RATE_LIMITS.create);
    if (!success) return rateLimitResponse(reset);

    const isPro = await isProMember(session.user.id);
    if (!isPro) {
      const count = await prisma.discount.count({
        where: { userId: session.user.id },
      });
      if (count >= FREE_DISCOUNT_LIMIT) {
        return NextResponse.json(
          {
            error: `Free members can create up to ${FREE_DISCOUNT_LIMIT} discounts. Upgrade to Pro for unlimited.`,
            limitReached: true,
          },
          { status: 403 }
        );
      }
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
    } = body;

    if (
      !title ||
      !description ||
      !productName ||
      !productUrl ||
      !discountType ||
      !discountValue
    ) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    if (!["PERCENTAGE", "FIXED_AMOUNT", "CUSTOM"].includes(discountType)) {
      return NextResponse.json(
        { error: "Invalid discount type" },
        { status: 400 }
      );
    }

    if (!couponCode && !discountUrl) {
      return NextResponse.json(
        { error: "A coupon code or discount URL is required" },
        { status: 400 }
      );
    }

    let slug = generateUniqueSlug(title);
    const existingSlug = await prisma.discount.findUnique({ where: { slug } });
    if (existingSlug) {
      slug = generateUniqueSlug(title);
    }

    const discount = await prisma.discount.create({
      data: {
        slug,
        title,
        description,
        productName,
        productUrl,
        discountType: discountType as DiscountType,
        discountValue,
        couponCode: couponCode || null,
        discountUrl: discountUrl || null,
        maxUses: maxUses ? parseInt(maxUses) : null,
        expiresAt: expiresAt ? new Date(expiresAt) : null,
        userId: session.user.id,
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

    return NextResponse.json({ discount }, { status: 201 });
  } catch (error) {
    console.error("Error creating discount:", error);
    return NextResponse.json(
      { error: "Failed to create discount" },
      { status: 500 }
    );
  }
}
