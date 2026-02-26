import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// DELETE /api/slack - Disconnect Slack for current user
export async function DELETE() {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await prisma.slackConnection.deleteMany({
      where: { userId: session.user.id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[Slack disconnect] Error:", error);
    return NextResponse.json(
      { error: "Failed to disconnect Slack" },
      { status: 500 }
    );
  }
}
