import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getAllUserEarnings } from "@/lib/services/rewards.service";

// Admin email whitelist
const ADMIN_EMAILS = [
  process.env.ADMIN_EMAIL,
].filter(Boolean);

async function isAdmin(email: string | null | undefined): Promise<boolean> {
  if (!email) return false;
  return ADMIN_EMAILS.includes(email);
}

/**
 * GET /api/admin/rewards/users - Get all users with earnings
 */
export async function GET(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.email || !(await isAdmin(session.user.email))) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const limit = Math.min(parseInt(searchParams.get("limit") || "50"), 100);
    const offset = parseInt(searchParams.get("offset") || "0");
    const filter = (searchParams.get("filter") || "all") as
      | "all"
      | "paused"
      | "flagged"
      | "hasBalance";

    const { users, total } = await getAllUserEarnings({
      limit,
      offset,
      filter,
    });

    return NextResponse.json({
      users,
      total,
      pagination: {
        limit,
        offset,
        hasMore: offset + users.length < total,
      },
    });
  } catch (error) {
    console.error("Error fetching user earnings:", error);
    return NextResponse.json(
      { error: "Failed to fetch user earnings" },
      { status: 500 }
    );
  }
}
