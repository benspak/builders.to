import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendSlackDM } from "@/lib/slack";

const BASE_URL = process.env.NEXTAUTH_URL || "https://builders.to";

/**
 * POST /api/cron/streak-reminders
 *
 * Send Slack DM to users who have Slack connected and have not posted a daily update today.
 * Optionally restrict to users with currentStreak > 0 to avoid spamming new signups.
 * Runs once per day (e.g. evening).
 *
 * Security: Requires CRON_SECRET in Authorization header.
 */
export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization");
    const cronSecret = process.env.CRON_SECRET;

    if (!cronSecret) {
      console.warn("CRON_SECRET not set - skipping authentication for development");
    } else if (authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const usersToRemind = await prisma.user.findMany({
      where: {
        slackConnection: { isNot: null },
        dailyUpdates: {
          none: {
            createdAt: { gte: today },
          },
        },
        OR: [
          { emailPreferences: null },
          { emailPreferences: { lastStreakReminderSentAt: null } },
          { emailPreferences: { lastStreakReminderSentAt: { lt: today } } },
        ],
      },
      select: {
        id: true,
        currentStreak: true,
        slackConnection: { select: { slackUserId: true } },
      },
    });

    let sent = 0;
    const userIdsUpdated: string[] = [];

    for (const user of usersToRemind) {
      if (!user.slackConnection?.slackUserId) continue;

      const message =
        user.currentStreak > 0
          ? `You haven't posted your daily update yet. Keep your ${user.currentStreak}-day streak: ${BASE_URL}/feed`
          : `You haven't posted your daily update yet. Share what you're building: ${BASE_URL}/feed`;

      const ok = await sendSlackDM(user.slackConnection.slackUserId, message);
      if (ok) {
        sent++;
        userIdsUpdated.push(user.id);
      }
    }

    if (userIdsUpdated.length > 0) {
      await Promise.all(
        userIdsUpdated.map((userId) =>
          prisma.emailPreferences.upsert({
            where: { userId },
            create: {
              userId,
              lastStreakReminderSentAt: new Date(),
            },
            update: {
              lastStreakReminderSentAt: new Date(),
            },
          })
        )
      );
    }

    return NextResponse.json({
      success: true,
      message: "Streak reminders completed",
      stats: {
        usersEligible: usersToRemind.length,
        slackSent: sent,
      },
    });
  } catch (error) {
    console.error("Streak reminders error:", error);
    return NextResponse.json(
      { error: "Failed to send streak reminders" },
      { status: 500 }
    );
  }
}
