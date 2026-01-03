import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendBatchEmails, generateWeeklyDigestEmail } from "@/lib/email";
import { getMilestoneLabel } from "@/lib/utils";

/**
 * POST /api/email/weekly-digest
 *
 * Trigger weekly digest emails for all users who have milestones with activity.
 * This endpoint should be called by a CRON job weekly.
 *
 * Security: Requires a secret token in the Authorization header
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
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

    // Find all users who have:
    // 1. Email preferences allowing weekly digest (or no preferences yet - default to true)
    // 2. Had milestone activity in the last week
    const usersWithActivity = await prisma.user.findMany({
      where: {
        email: { not: null },
        OR: [
          { emailPreferences: null }, // Default to send
          { emailPreferences: { weeklyDigest: true } },
        ],
        projects: {
          some: {
            milestones: {
              some: {
                createdAt: { gte: oneWeekAgo },
              },
            },
          },
        },
      },
      select: {
        id: true,
        email: true,
        name: true,
        firstName: true,
        lastName: true,
        projects: {
          select: {
            id: true,
            title: true,
            slug: true,
            milestones: {
              where: {
                createdAt: { gte: oneWeekAgo },
              },
              select: {
                id: true,
                type: true,
                title: true,
                achievedAt: true,
                feedEvent: {
                  select: {
                    _count: {
                      select: { likes: true },
                    },
                  },
                },
              },
            },
          },
        },
        emailPreferences: {
          select: {
            lastDigestSentAt: true,
          },
        },
      },
    });

    // Prepare all emails for batch sending
    const emailsToSend: Array<{
      userId: string;
      email: string;
      subject: string;
      html: string;
      text: string;
      totalCelebrations: number;
    }> = [];

    for (const user of usersWithActivity) {
      if (!user.email) continue;

      // Skip if we already sent a digest this week
      if (user.emailPreferences?.lastDigestSentAt) {
        const lastSent = new Date(user.emailPreferences.lastDigestSentAt);
        if (lastSent >= oneWeekAgo) {
          continue;
        }
      }

      // Collect milestone data
      const milestones: Array<{
        projectTitle: string;
        projectSlug: string;
        milestoneType: string;
        milestoneTitle: string;
        celebrationCount: number;
        achievedAt: Date;
      }> = [];

      let totalCelebrations = 0;

      for (const project of user.projects) {
        for (const milestone of project.milestones) {
          const celebrationCount = milestone.feedEvent?._count?.likes || 0;
          totalCelebrations += celebrationCount;

          milestones.push({
            projectTitle: project.title,
            projectSlug: project.slug || project.id,
            milestoneType: milestone.type,
            milestoneTitle: milestone.type === "CUSTOM" && milestone.title
              ? milestone.title
              : getMilestoneLabel(milestone.type),
            celebrationCount,
            achievedAt: milestone.achievedAt,
          });
        }
      }

      // Sort by date, newest first
      milestones.sort((a, b) =>
        new Date(b.achievedAt).getTime() - new Date(a.achievedAt).getTime()
      );

      const userName = user.firstName && user.lastName
        ? user.firstName
        : user.name?.split(" ")[0] || "Builder";

      const { html, text } = generateWeeklyDigestEmail({
        userName,
        milestones,
        totalCelebrations,
        baseUrl,
      });

      emailsToSend.push({
        userId: user.id,
        email: user.email,
        subject: totalCelebrations > 0
          ? `🎉 ${totalCelebrations} celebration${totalCelebrations !== 1 ? 's' : ''} this week!`
          : "Your Weekly Milestone Digest",
        html,
        text,
        totalCelebrations,
      });
    }

    // Send emails in batch using Resend
    const { success: sentCount, failed: errorCount } = await sendBatchEmails(
      emailsToSend.map(e => ({
        to: e.email,
        subject: e.subject,
        html: e.html,
        text: e.text,
      }))
    );

    // Update database for successfully queued emails
    // Note: Resend batch is async, so we update all as sent
    if (sentCount > 0) {
      const userIds = emailsToSend.map(e => e.userId);

      // Batch update email preferences
      await Promise.all(
        userIds.map(userId =>
          prisma.emailPreferences.upsert({
            where: { userId },
            create: {
              userId,
              lastDigestSentAt: new Date(),
            },
            update: {
              lastDigestSentAt: new Date(),
            },
          })
        )
      );

      // Batch create in-app notifications
      await prisma.notification.createMany({
        data: emailsToSend.map(e => ({
          type: "WEEKLY_DIGEST" as const,
          title: "Weekly digest sent! 📬",
          message: `Your weekly milestone summary has been sent to ${e.email}`,
          userId: e.userId,
        })),
      });
    }

    return NextResponse.json({
      success: true,
      message: `Weekly digest completed`,
      stats: {
        usersProcessed: usersWithActivity.length,
        emailsQueued: emailsToSend.length,
        emailsSent: sentCount,
        errors: errorCount,
      },
    });
  } catch (error) {
    console.error("Weekly digest error:", error);
    return NextResponse.json(
      { error: "Failed to send weekly digest" },
      { status: 500 }
    );
  }
}

// GET endpoint for testing/checking status
export async function GET() {
  const oneWeekAgo = new Date();
  oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

  const usersWithActivity = await prisma.user.count({
    where: {
      email: { not: null },
      projects: {
        some: {
          milestones: {
            some: {
              createdAt: { gte: oneWeekAgo },
            },
          },
        },
      },
    },
  });

  const totalMilestones = await prisma.projectMilestone.count({
    where: {
      createdAt: { gte: oneWeekAgo },
    },
  });

  const totalCelebrations = await prisma.feedEventLike.count({
    where: {
      createdAt: { gte: oneWeekAgo },
    },
  });

  return NextResponse.json({
    status: "ready",
    stats: {
      usersWithActivity,
      milestonesThisWeek: totalMilestones,
      celebrationsThisWeek: totalCelebrations,
    },
    note: "POST to this endpoint to trigger the weekly digest (requires CRON_SECRET)",
  });
}
