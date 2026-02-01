import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getUserPartnerships } from "@/lib/services/accountability.service";
import { PartnershipStatus } from "@prisma/client";

// GET /api/accountability - Get user's partnerships
export async function GET(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const statusParam = searchParams.get("status");
    const limit = parseInt(searchParams.get("limit") || "20", 10);
    const offset = parseInt(searchParams.get("offset") || "0", 10);

    // Parse status filter
    let status: PartnershipStatus | PartnershipStatus[] | undefined;
    if (statusParam) {
      if (statusParam === "active") {
        status = "ACTIVE";
      } else if (statusParam === "pending") {
        status = "PENDING";
      } else if (statusParam === "all_active") {
        status = ["ACTIVE", "PENDING"];
      }
    }

    const { partnerships, total } = await getUserPartnerships(session.user.id, {
      status,
      limit: Math.min(limit, 50),
      offset,
    });

    return NextResponse.json({
      partnerships,
      total,
      limit,
      offset,
    });
  } catch (error) {
    console.error("Error fetching partnerships:", error);
    return NextResponse.json(
      { error: "Failed to fetch partnerships" },
      { status: 500 }
    );
  }
}
