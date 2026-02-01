import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getUserKarmaInfo } from "@/lib/services/karma.service";

// GET /api/karma - Get current user's karma info
export async function GET(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const karmaInfo = await getUserKarmaInfo(session.user.id);

    if (!karmaInfo) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(karmaInfo);
  } catch (error) {
    console.error("Error fetching karma info:", error);
    return NextResponse.json(
      { error: "Failed to fetch karma info" },
      { status: 500 }
    );
  }
}
