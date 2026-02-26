import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getUserConnections } from "@/lib/services/platforms.service";
import { prisma } from "@/lib/prisma";

// GET /api/platforms - Get user's connected platforms and Slack status
export async function GET() {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const [connections, slackConnection] = await Promise.all([
      getUserConnections(session.user.id),
      prisma.slackConnection.findUnique({
        where: { userId: session.user.id },
        select: { connectedAt: true },
      }),
    ]);

    return NextResponse.json({
      platforms: connections,
      slack: { connected: !!slackConnection, connectedAt: slackConnection?.connectedAt ?? null },
    });
  } catch (error) {
    console.error("Error fetching platforms:", error);
    return NextResponse.json(
      { error: "Failed to fetch platforms" },
      { status: 500 }
    );
  }
}
