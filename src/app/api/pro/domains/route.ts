import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { isProMember } from "@/lib/stripe-subscription";

/**
 * GET /api/pro/domains
 * List user's custom domains
 */
export async function GET() {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "You must be signed in" },
        { status: 401 }
      );
    }

    const domains = await prisma.customDomain.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        domain: true,
        verified: true,
        verifiedAt: true,
        createdAt: true,
      },
    });

    return NextResponse.json({ domains });
  } catch (error) {
    console.error("[Pro Domains] Error fetching domains:", error);
    return NextResponse.json(
      { error: "Failed to fetch domains" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/pro/domains
 * Add a new custom domain (Pro only)
 */
export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "You must be signed in" },
        { status: 401 }
      );
    }

    // Check if user is a Pro member
    const isPro = await isProMember(session.user.id);
    if (!isPro) {
      return NextResponse.json(
        { error: "Custom domains are only available for Pro members" },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { domain } = body;

    if (!domain || typeof domain !== "string") {
      return NextResponse.json(
        { error: "Domain is required" },
        { status: 400 }
      );
    }

    // Clean and validate domain
    const cleanDomain = domain.toLowerCase().trim();

    // Basic domain validation
    const domainRegex = /^[a-z0-9]([a-z0-9-]*[a-z0-9])?(\.[a-z0-9]([a-z0-9-]*[a-z0-9])?)+$/;
    if (!domainRegex.test(cleanDomain)) {
      return NextResponse.json(
        { error: "Invalid domain format" },
        { status: 400 }
      );
    }

    // Prevent using builders.to subdomains
    if (cleanDomain.endsWith("builders.to")) {
      return NextResponse.json(
        { error: "Cannot use builders.to subdomains" },
        { status: 400 }
      );
    }

    // Check if domain already exists
    const existingDomain = await prisma.customDomain.findUnique({
      where: { domain: cleanDomain },
    });

    if (existingDomain) {
      return NextResponse.json(
        { error: "This domain is already registered" },
        { status: 400 }
      );
    }

    // Create domain record
    const newDomain = await prisma.customDomain.create({
      data: {
        userId: session.user.id,
        domain: cleanDomain,
      },
      select: {
        id: true,
        domain: true,
        verified: true,
        createdAt: true,
      },
    });

    // Return with DNS instructions
    return NextResponse.json({
      domain: newDomain,
      instructions: {
        type: "CNAME",
        name: cleanDomain,
        value: "builders.to",
        note: "Add this CNAME record to your DNS settings, then verify the domain.",
      },
    });
  } catch (error) {
    console.error("[Pro Domains] Error adding domain:", error);
    return NextResponse.json(
      { error: "Failed to add domain" },
      { status: 500 }
    );
  }
}
