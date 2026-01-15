import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

/**
 * GET /api/pro/domains/lookup
 * Look up a custom domain and return the associated user slug
 * Used by middleware for custom domain routing
 */
export async function GET(request: NextRequest) {
  try {
    const domain = request.nextUrl.searchParams.get("domain");

    if (!domain) {
      return NextResponse.json(
        { error: "Domain parameter is required" },
        { status: 400 }
      );
    }

    // Look up the domain
    const customDomain = await prisma.customDomain.findUnique({
      where: {
        domain: domain.toLowerCase(),
      },
      select: {
        verified: true,
        user: {
          select: {
            slug: true,
            proSubscription: {
              select: {
                status: true,
              },
            },
          },
        },
      },
    });

    // Domain not found
    if (!customDomain) {
      return NextResponse.json(
        { error: "Domain not found" },
        { status: 404 }
      );
    }

    // Domain not verified
    if (!customDomain.verified) {
      return NextResponse.json(
        { error: "Domain not verified" },
        { status: 400 }
      );
    }

    // User doesn't have an active Pro subscription
    if (customDomain.user.proSubscription?.status !== "ACTIVE") {
      return NextResponse.json(
        { error: "Pro subscription not active" },
        { status: 400 }
      );
    }

    // User doesn't have a slug
    if (!customDomain.user.slug) {
      return NextResponse.json(
        { error: "User profile not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      slug: customDomain.user.slug,
    });
  } catch (error) {
    console.error("[Domain Lookup] Error:", error);
    return NextResponse.json(
      { error: "Failed to look up domain" },
      { status: 500 }
    );
  }
}
