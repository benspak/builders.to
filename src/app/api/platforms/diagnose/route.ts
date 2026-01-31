import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { diagnoseXConnection } from "@/lib/services/twitter.service";

// GET /api/platforms/diagnose - Diagnose X connection issues
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
    const platform = searchParams.get("platform") || "twitter";

    if (platform !== "twitter") {
      return NextResponse.json(
        { error: "Only Twitter/X diagnosis is currently supported" },
        { status: 400 }
      );
    }

    const diagnosis = await diagnoseXConnection(session.user.id);

    return NextResponse.json({
      platform: "twitter",
      diagnosis,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Error diagnosing platform:", error);
    return NextResponse.json(
      { error: "Failed to diagnose platform", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}
