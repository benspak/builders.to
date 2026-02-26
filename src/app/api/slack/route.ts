import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getSlackConnectionByUserId, sendSlackDM, buildSlackBlocks } from "@/lib/slack";

// POST /api/slack - Send a test notification to the user's Slack DM
export async function POST() {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const conn = await getSlackConnectionByUserId(session.user.id);
    if (!conn) {
      return NextResponse.json(
        { error: "No Slack connection found. Connect Slack first." },
        { status: 400 }
      );
    }

    const baseUrl = process.env.NEXTAUTH_URL || "https://builders.to";
    const text = "This is a test notification from Builders.to. If you see this, Slack notifications are working.";
    const blocks = buildSlackBlocks(
      "Builders.to test",
      "Slack notifications are connected correctly.",
      `${baseUrl}/feed`
    );

    const sent = await sendSlackDM(conn.slackUserId, text, blocks);

    if (!sent) {
      return NextResponse.json(
        {
          error:
            "Failed to send test message to Slack. Check server logs for the Slack API error. Common fixes: add Bot Token Scope im:write, enable App Home → Messages tab. See docs/SLACK_APP_SETUP.md",
        },
        { status: 502 }
      );
    }

    return NextResponse.json({ success: true, message: "Test notification sent to your Slack DMs." });
  } catch (error) {
    console.error("[Slack test] Error:", error);
    return NextResponse.json(
      { error: "Failed to send test notification" },
      { status: 500 }
    );
  }
}

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
