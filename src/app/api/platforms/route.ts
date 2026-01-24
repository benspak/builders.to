import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getUserConnections } from "@/lib/services/platforms.service";

// GET /api/platforms - Get user's connected platforms
export async function GET() {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const connections = await getUserConnections(session.user.id);

    return NextResponse.json({ platforms: connections });
  } catch (error) {
    console.error("Error fetching platforms:", error);
    return NextResponse.json(
      { error: "Failed to fetch platforms" },
      { status: 500 }
    );
  }
}
