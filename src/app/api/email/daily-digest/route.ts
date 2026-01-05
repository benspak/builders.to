import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendBatchEmails, generateDailyDigestEmail } from "@/lib/email";

/**
 * POST /api/email/daily-digest
 *
 * Trigger daily digest emails for all users who received likes/upvotes/celebrations.
 * This endpoint should be called by a CRON job daily at 6 PM UTC.
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
    const oneDayAgo = new Date();
    oneDayAgo.setDate(oneDayAgo.getDate() - 1);

    // Find all users who have:
    // 1. Email preferences allowing daily digest (or no preferences yet - default to true)
    // 2. Received notifications in the last 24 hours
    const usersWithNotifications = await prisma.user.findMany({
      where: {
        email: { not: null },
        OR: [
          { emailPreferences: null }, // Default to send
          { emailPreferences: { dailyDigest: true } },
        ],
        notifications: {
          some: {
            createdAt: { gte: oneDayAgo },
            type: {
              in: ["UPDATE_LIKED", "PROJECT_UPVOTED", "MILESTONE_LIKED"],
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
        notifications: {
          where: {
            createdAt: { gte: oneDayAgo },
            type: {
              in: ["UPDATE_LIKED", "PROJECT_UPVOTED", "MILESTONE_LIKED"],
            },
          },
          select: {
            id: true,
            type: true,
            title: true,
            message: true,
            actorName: true,
            actorId: true,
            projectId: true,
            updateId: true,
            feedEventId: true,
            project: {
              select: {
                title: true,
                slug: true,
              },
            },
            update: {
              select: {
                content: true,
              },
            },
            feedEvent: {
              select: {
                title: true,
                milestone: {
                  select: {
                    project: {
                      select: {
                        title: true,
                        slug: true,
                      },
                    },
                  },
                },
              },
            },
          },
        },
        emailPreferences: {
          select: {
            lastDailyDigestSentAt: true,
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
      totalActivity: number;
    }> = [];

    for (const user of usersWithNotifications) {
      if (!user.email) continue;

      // Skip if we already sent a digest today
      if (user.emailPreferences?.lastDailyDigestSentAt) {
        const lastSent = new Date(user.emailPreferences.lastDailyDigestSentAt);
        if (lastSent >= oneDayAgo) {
          continue;
        }
      }

      // Group notifications by type
      const updateLikesMap = new Map<string, {
        updatePreview: string;
        likerNames: string[];
      }>();
      const projectUpvotesMap = new Map<string, {
        projectTitle: string;
        projectSlug: string;
        voterNames: string[];
      }>();
      const milestoneCelebrationsMap = new Map<string, {
        projectTitle: string;
        projectSlug: string;
        milestoneTitle: string;
        celebratorNames: string[];
      }>();

      for (const notification of user.notifications) {
        const actorName = notification.actorName || "Someone";

        switch (notification.type) {
          case "UPDATE_LIKED": {
            const updateId = notification.updateId;
            if (updateId) {
              const existing = updateLikesMap.get(updateId);
              const updatePreview = notification.update?.content
                ? notification.update.content.length > 60
                  ? notification.update.content.substring(0, 60) + "..."
                  : notification.update.content
                : "your update";

              if (existing) {
                if (!existing.likerNames.includes(actorName)) {
                  existing.likerNames.push(actorName);
                }
              } else {
                updateLikesMap.set(updateId, {
                  updatePreview,
                  likerNames: [actorName],
                });
              }
            }
            break;
          }

          case "PROJECT_UPVOTED": {
            const projectId = notification.projectId;
            if (projectId && notification.project) {
              const existing = projectUpvotesMap.get(projectId);
              if (existing) {
                if (!existing.voterNames.includes(actorName)) {
                  existing.voterNames.push(actorName);
                }
              } else {
                projectUpvotesMap.set(projectId, {
                  projectTitle: notification.project.title,
                  projectSlug: notification.project.slug || projectId,
                  voterNames: [actorName],
                });
              }
            }
            break;
          }

          case "MILESTONE_LIKED": {
            const feedEventId = notification.feedEventId;
            if (feedEventId && notification.feedEvent) {
              const existing = milestoneCelebrationsMap.get(feedEventId);
              const project = notification.feedEvent.milestone?.project;
              if (existing) {
                if (!existing.celebratorNames.includes(actorName)) {
                  existing.celebratorNames.push(actorName);
                }
              } else if (project) {
                milestoneCelebrationsMap.set(feedEventId, {
                  projectTitle: project.title,
                  projectSlug: project.slug || "",
                  milestoneTitle: notification.feedEvent.title,
                  celebratorNames: [actorName],
                });
              }
            }
            break;
          }
        }
      }

      // Convert maps to arrays
      const updateLikes = Array.from(updateLikesMap.values()).map(u => ({
        ...u,
        totalLikes: u.likerNames.length,
      }));

      const projectUpvotes = Array.from(projectUpvotesMap.values()).map(p => ({
        ...p,
        totalUpvotes: p.voterNames.length,
      }));

      const milestoneCelebrations = Array.from(milestoneCelebrationsMap.values()).map(m => ({
        ...m,
        totalCelebrations: m.celebratorNames.length,
      }));

      const totalActivity = updateLikes.length + projectUpvotes.length + milestoneCelebrations.length;

      // Skip if no meaningful activity after grouping
      if (totalActivity === 0) continue;

      const userName = user.firstName && user.lastName
        ? user.firstName
        : user.name?.split(" ")[0] || "Builder";

      const { html, text } = generateDailyDigestEmail({
        userName,
        updateLikes,
        projectUpvotes,
        milestoneCelebrations,
        baseUrl,
      });

      emailsToSend.push({
        userId: user.id,
        email: user.email,
        subject: `✨ You had ${totalActivity} interaction${totalActivity !== 1 ? 's' : ''} today!`,
        html,
        text,
        totalActivity,
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
    if (sentCount > 0) {
      const userIds = emailsToSend.map(e => e.userId);

      // Batch update email preferences
      await Promise.all(
        userIds.map(userId =>
          prisma.emailPreferences.upsert({
            where: { userId },
            create: {
              userId,
              lastDailyDigestSentAt: new Date(),
            },
            update: {
              lastDailyDigestSentAt: new Date(),
            },
          })
        )
      );
    }

    return NextResponse.json({
      success: true,
      message: `Daily digest completed`,
      stats: {
        usersProcessed: usersWithNotifications.length,
        emailsQueued: emailsToSend.length,
        emailsSent: sentCount,
        errors: errorCount,
      },
    });
  } catch (error) {
    console.error("Daily digest error:", error);
    return NextResponse.json(
      { error: "Failed to send daily digest" },
      { status: 500 }
    );
  }
}

// GET endpoint for testing/checking status
export async function GET() {
  const oneDayAgo = new Date();
  oneDayAgo.setDate(oneDayAgo.getDate() - 1);

  const [usersWithActivity, totalUpdateLikes, totalProjectUpvotes, totalMilestoneLikes] = await Promise.all([
    prisma.user.count({
      where: {
        email: { not: null },
        notifications: {
          some: {
            createdAt: { gte: oneDayAgo },
            type: {
              in: ["UPDATE_LIKED", "PROJECT_UPVOTED", "MILESTONE_LIKED"],
            },
          },
        },
      },
    }),
    prisma.notification.count({
      where: {
        createdAt: { gte: oneDayAgo },
        type: "UPDATE_LIKED",
      },
    }),
    prisma.notification.count({
      where: {
        createdAt: { gte: oneDayAgo },
        type: "PROJECT_UPVOTED",
      },
    }),
    prisma.notification.count({
      where: {
        createdAt: { gte: oneDayAgo },
        type: "MILESTONE_LIKED",
      },
    }),
  ]);

  return NextResponse.json({
    status: "ready",
    stats: {
      usersWithActivity,
      updateLikesToday: totalUpdateLikes,
      projectUpvotesToday: totalProjectUpvotes,
      milestoneLikesToday: totalMilestoneLikes,
    },
    note: "POST to this endpoint to trigger the daily digest (requires CRON_SECRET). Run at 6 PM UTC.",
  });
}
