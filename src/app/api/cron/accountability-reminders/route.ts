import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendBatchEmails, generateAccountabilityReminderEmail } from "@/lib/email";
import { sendSlackDM } from "@/lib/slack";

/**
 * POST /api/cron/accountability-reminders
 *
 * Send daily email reminders to users with active accountability partnerships
 * who haven't posted an update or check-in today.
 *
 * Runs daily at 2 PM UTC (morning for US West Coast, afternoon for US East Coast / Europe).
 *
 * Security: Requires a secret token in the Authorization header.
 * Set CRON_SECRET in your environment variables.
 */
export async function POST(request: NextRequest) {
  try {
    // Verify CRON secret
    const authHeader = request.headers.get("authorization");
    const cronSecret = process.env.CRON_SECRET;

    if (!cronSecret) {
      console.warn("CRON_SECRET not set - skipping authentication for development");
    } else if (authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const baseUrl = process.env.NEXTAUTH_URL || "https://builders.to";
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Find all users who:
    // 1. Have an email address
    // 2. Have accountability reminders enabled (or no preferences yet - default true)
    // 3. Have at least one ACTIVE accountability partnership
    // 4. Have NOT already checked in today
    const usersWithActivePartnerships = await prisma.user.findMany({
      where: {
        email: { not: null },
        OR: [
          { emailPreferences: null },
          { emailPreferences: { accountabilityReminders: true } },
        ],
        AND: [
          {
            OR: [
              { partnershipRequestsSent: { some: { status: "ACTIVE" } } },
              { partnershipRequestsReceived: { some: { status: "ACTIVE" } } },
            ],
          },
        ],
      },
      select: {
        id: true,
        email: true,
        name: true,
        firstName: true,
        lastName: true,
        currentStreak: true,
        partnershipRequestsSent: {
          where: { status: "ACTIVE" },
          select: {
            id: true,
            partner: {
              select: {
                displayName: true,
                firstName: true,
                lastName: true,
                name: true,
              },
            },
            checkIns: {
              where: {
                createdAt: { gte: today },
              },
              select: { userId: true },
            },
          },
        },
        partnershipRequestsReceived: {
          where: { status: "ACTIVE" },
          select: {
            id: true,
            requester: {
              select: {
                displayName: true,
                firstName: true,
                lastName: true,
                name: true,
              },
            },
            checkIns: {
              where: {
                createdAt: { gte: today },
              },
              select: { userId: true },
            },
          },
        },
        emailPreferences: {
          select: {
            lastAccountabilityReminderSentAt: true,
          },
        },
        slackConnection: {
          select: { slackUserId: true },
        },
      },
    });

    const emailsToSend: Array<{
      userId: string;
      email: string;
      subject: string;
      html: string;
      text: string;
    }> = [];
    const slackRemindersToSend: Array<{ userId: string; slackUserId: string; text: string }> = [];

    for (const user of usersWithActivePartnerships) {
      if (!user.email) continue;

      // Skip if we already sent a reminder today
      if (user.emailPreferences?.lastAccountabilityReminderSentAt) {
        const lastSent = new Date(user.emailPreferences.lastAccountabilityReminderSentAt);
        lastSent.setHours(0, 0, 0, 0);
        if (lastSent.getTime() >= today.getTime()) {
          continue;
        }
      }

      // Check if user already checked in today across any partnership
      const allPartnerships = [
        ...user.partnershipRequestsSent,
        ...user.partnershipRequestsReceived,
      ];

      const hasCheckedInToday = allPartnerships.some((p) =>
        p.checkIns.some((c) => c.userId === user.id)
      );

      // Skip users who already checked in
      if (hasCheckedInToday) continue;

      // Collect partner names
      const partnerNames: string[] = [];
      for (const p of user.partnershipRequestsSent) {
        const partner = p.partner;
        const name = partner.displayName
          || (partner.firstName && partner.lastName ? `${partner.firstName} ${partner.lastName}` : null)
          || partner.name
          || "A fellow builder";
        if (!partnerNames.includes(name)) {
          partnerNames.push(name);
        }
      }
      for (const p of user.partnershipRequestsReceived) {
        const partner = p.requester;
        const name = partner.displayName
          || (partner.firstName && partner.lastName ? `${partner.firstName} ${partner.lastName}` : null)
          || partner.name
          || "A fellow builder";
        if (!partnerNames.includes(name)) {
          partnerNames.push(name);
        }
      }

      if (partnerNames.length === 0) continue;

      const userName = user.firstName && user.lastName
        ? user.firstName
        : user.name?.split(" ")[0] || "Builder";

      const { html, text } = generateAccountabilityReminderEmail({
        userName,
        partnerNames,
        currentStreak: user.currentStreak,
        baseUrl,
      });

      const streakEmoji = user.currentStreak > 0 ? " \u{1F525}" : "";
      emailsToSend.push({
        userId: user.id,
        email: user.email,
        subject: `Don't forget to check in today${streakEmoji}`,
        html,
        text,
      });

      if (user.slackConnection?.slackUserId) {
        const slackText = `Don't forget to check in today${streakEmoji}\n${baseUrl}/feed`;
        slackRemindersToSend.push({
          userId: user.id,
          slackUserId: user.slackConnection.slackUserId,
          text: slackText,
        });
      }
    }

    // Send emails in batch
    const { success: sentCount, failed: errorCount } = await sendBatchEmails(
      emailsToSend.map((e) => ({
        to: e.email,
        subject: e.subject,
        html: e.html,
        text: e.text,
      }))
    );

    // Send Slack reminders
    let slackSent = 0;
    for (const r of slackRemindersToSend) {
      const ok = await sendSlackDM(r.slackUserId, r.text);
      if (ok) slackSent++;
    }

    // Update last sent timestamp for users who received email or Slack reminder
    const uniqueUserIds = [
      ...new Set([
        ...emailsToSend.map((e) => e.userId),
        ...slackRemindersToSend.map((r) => r.userId),
      ]),
    ];
    if (sentCount > 0 || slackSent > 0) {
      await Promise.all(
        uniqueUserIds.map((userId) =>
          prisma.emailPreferences.upsert({
            where: { userId },
            create: {
              userId,
              lastAccountabilityReminderSentAt: new Date(),
            },
            update: {
              lastAccountabilityReminderSentAt: new Date(),
            },
          })
        )
      );
    }

    return NextResponse.json({
      success: true,
      message: "Accountability reminders completed",
      stats: {
        usersProcessed: usersWithActivePartnerships.length,
        emailsQueued: emailsToSend.length,
        emailsSent: sentCount,
        errors: errorCount,
        slackRemindersSent: slackSent,
      },
    });
  } catch (error) {
    console.error("Accountability reminders error:", error);
    return NextResponse.json(
      { error: "Failed to send accountability reminders" },
      { status: 500 }
    );
  }
}

// GET endpoint for testing/checking status
export async function GET() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const [activePartnerships, usersWithPartners, checkedInToday] = await Promise.all([
    prisma.accountabilityPartnership.count({
      where: { status: "ACTIVE" },
    }),
    prisma.user.count({
      where: {
        email: { not: null },
        OR: [
          { partnershipRequestsSent: { some: { status: "ACTIVE" } } },
          { partnershipRequestsReceived: { some: { status: "ACTIVE" } } },
        ],
      },
    }),
    prisma.accountabilityCheckIn.findMany({
      where: {
        createdAt: { gte: today },
      },
      select: { userId: true },
      distinct: ["userId"],
    }),
  ]);

  return NextResponse.json({
    status: "ready",
    stats: {
      activePartnerships,
      usersWithPartners,
      checkedInToday: checkedInToday.length,
      potentialReminders: usersWithPartners - checkedInToday.length,
    },
    note: "POST to this endpoint to trigger accountability reminders (requires CRON_SECRET). Runs at 2 PM UTC.",
  });
}
