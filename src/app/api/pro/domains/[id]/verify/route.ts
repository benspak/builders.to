import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import dns from "dns";
import { promisify } from "util";

const resolveCname = promisify(dns.resolveCname);

interface RouteParams {
  params: Promise<{ id: string }>;
}

/**
 * POST /api/pro/domains/[id]/verify
 * Verify DNS configuration for a custom domain
 */
export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await auth();
    const { id } = await params;

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "You must be signed in" },
        { status: 401 }
      );
    }

    // Find the domain and verify ownership
    const domain = await prisma.customDomain.findUnique({
      where: { id },
      select: {
        id: true,
        domain: true,
        userId: true,
        verified: true,
      },
    });

    if (!domain) {
      return NextResponse.json(
        { error: "Domain not found" },
        { status: 404 }
      );
    }

    if (domain.userId !== session.user.id) {
      return NextResponse.json(
        { error: "You don't have permission to verify this domain" },
        { status: 403 }
      );
    }

    // Already verified
    if (domain.verified) {
      return NextResponse.json({
        verified: true,
        message: "Domain is already verified",
      });
    }

    // Check DNS CNAME record
    let cnameRecords: string[] = [];
    try {
      cnameRecords = await resolveCname(domain.domain);
    } catch (dnsError) {
      // DNS lookup failed - likely no CNAME record exists
      const errorMessage = dnsError instanceof Error ? dnsError.message : "Unknown error";
      console.log(`[Pro Domains] DNS lookup failed for ${domain.domain}: ${errorMessage}`);
      
      return NextResponse.json({
        verified: false,
        message: "CNAME record not found. Please add a CNAME record pointing to builders.to",
        instructions: {
          type: "CNAME",
          name: domain.domain,
          value: "builders.to",
        },
      });
    }

    // Check if CNAME points to builders.to
    const isValid = cnameRecords.some(
      (record) =>
        record.toLowerCase() === "builders.to" ||
        record.toLowerCase() === "builders.to."
    );

    if (!isValid) {
      return NextResponse.json({
        verified: false,
        message: `CNAME record found but points to ${cnameRecords[0]} instead of builders.to`,
        instructions: {
          type: "CNAME",
          name: domain.domain,
          value: "builders.to",
          current: cnameRecords[0],
        },
      });
    }

    // Mark as verified
    await prisma.customDomain.update({
      where: { id },
      data: {
        verified: true,
        verifiedAt: new Date(),
      },
    });

    return NextResponse.json({
      verified: true,
      message: "Domain verified successfully! Your custom domain is now active.",
    });
  } catch (error) {
    console.error("[Pro Domains] Error verifying domain:", error);
    return NextResponse.json(
      { error: "Failed to verify domain" },
      { status: 500 }
    );
  }
}
