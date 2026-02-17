import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { rateLimit, RATE_LIMITS, rateLimitResponse } from "@/lib/rate-limit";
import { extractMentions } from "@/lib/utils";
import { sendUserPushNotification } from "@/lib/push-notifications";
import { awardKarmaForUpdate, awardKarmaForStreakMilestone } from "@/lib/services/karma.service";
import { autoCheckInFromUpdate } from "@/lib/services/accountability.service";
import { isProMember } from "@/lib/stripe-subscription";

// GET /api/updates - Get updates for a user or global feed
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");
    const limit = parseInt(searchParams.get("limit") || "20", 10);
    const cursor = searchParams.get("cursor");

    const updates = await prisma.dailyUpdate.findMany({
      where: userId ? { userId } : undefined,
      orderBy: { createdAt: "desc" },
      take: Math.min(limit, 50),
      ...(cursor && {
        skip: 1,
        cursor: { id: cursor },
      }),
      select: {
        id: true,
        content: true,
        imageUrl: true,
        gifUrl: true,
        createdAt: true,
        user: {
          select: {
            id: true,
            name: true,
            firstName: true,
            lastName: true,
            image: true,
            slug: true,
            headline: true,
            // Include first company with logo for display next to username
            companies: {
              where: {
                logo: { not: null },
              },
              take: 1,
              orderBy: { createdAt: "asc" },
              select: {
                id: true,
                name: true,
                slug: true,
                logo: true,
              },
            },
          },
        },
      },
    });

    const nextCursor = updates.length === limit ? updates[updates.length - 1]?.id : null;

    return NextResponse.json({
      updates,
      nextCursor,
    });
  } catch (error) {
    console.error("Error fetching updates:", error);
    return NextResponse.json(
      { error: "Failed to fetch updates" },
      { status: 500 }
    );
  }
}

// POST /api/updates - Create a new daily update
export async function POST(request: NextRequest) {
  try {
    // Rate limit check - abuse prevention (daily post limits enforced separately below)
    const { success, reset } = rateLimit(request, RATE_LIMITS.createUpdate);
    if (!success) {
      return rateLimitResponse(reset);
    }

    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Check membership tier and enforce daily post limits
    const isPro = await isProMember(session.user.id);
    const dailyPostLimit = isPro ? 20 : 3;

    // Count how many updates the user has posted today
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const todayPostCount = await prisma.dailyUpdate.count({
      where: {
        userId: session.user.id,
        createdAt: { gte: startOfDay },
      },
    });

    if (todayPostCount >= dailyPostLimit) {
      const limitLabel = isPro ? "20 posts" : "3 posts";
      return NextResponse.json(
        {
          error: isPro
            ? `You've reached your daily limit of ${limitLabel}. Come back tomorrow!`
            : `Free members can post ${limitLabel} per day. Upgrade to Pro for up to 20 posts per day!`,
          code: "DAILY_LIMIT_REACHED",
          dailyLimit: dailyPostLimit,
          postsToday: todayPostCount,
          isPro,
        },
        { status: 429 }
      );
    }

    const body = await request.json();
    const { content, imageUrl, gifUrl, pollOptions } = body;

    if (!content || content.trim().length === 0) {
      return NextResponse.json(
        { error: "Content is required" },
        { status: 400 }
      );
    }

    if (content.length > 10000) {
      return NextResponse.json(
        { error: "Content must be 10,000 characters or less" },
        { status: 400 }
      );
    }

    // Validate poll options if provided
    let validatedPollOptions: { text: string; order: number }[] | null = null;
    if (pollOptions && Array.isArray(pollOptions) && pollOptions.length > 0) {
      if (pollOptions.length < 2) {
        return NextResponse.json(
          { error: "At least 2 poll options are required" },
          { status: 400 }
        );
      }
      if (pollOptions.length > 5) {
        return NextResponse.json(
          { error: "Maximum 5 poll options allowed" },
          { status: 400 }
        );
      }

      validatedPollOptions = pollOptions.map((opt: string, index: number) => {
        const text = typeof opt === "string" ? opt.trim() : "";
        if (!text || text.length === 0) {
          throw new Error(`Option ${index + 1} is empty`);
        }
        if (text.length > 50) {
          throw new Error(`Option ${index + 1} must be 50 characters or less`);
        }
        return { text, order: index };
      });
    }

    // Calculate and update streak
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { currentStreak: true, longestStreak: true, lastActivityDate: true },
    });

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    let newStreak = 1;
    let longestStreak = user?.longestStreak || 0;

    if (user?.lastActivityDate) {
      const lastActivity = new Date(user.lastActivityDate);
      lastActivity.setHours(0, 0, 0, 0);

      const daysDiff = Math.floor((today.getTime() - lastActivity.getTime()) / (1000 * 60 * 60 * 24));

      if (daysDiff === 0) {
        // Same day - keep current streak
        newStreak = user.currentStreak || 1;
      } else if (daysDiff === 1) {
        // Consecutive day - increment streak
        newStreak = (user.currentStreak || 0) + 1;
      }
      // daysDiff > 1 means streak is broken, starts at 1
    }

    if (newStreak > longestStreak) {
      longestStreak = newStreak;
    }

    // Calculate poll expiration (7 days from now) if poll is included
    let pollExpiresAt: Date | null = null;
    if (validatedPollOptions) {
      pollExpiresAt = new Date();
      pollExpiresAt.setDate(pollExpiresAt.getDate() + 7);
    }

    // Create update and update user streak in a transaction
    const [update] = await prisma.$transaction([
      prisma.dailyUpdate.create({
        data: {
          content: content.trim(),
          imageUrl: imageUrl || null,
          gifUrl: gifUrl || null,
          userId: session.user.id,
          // Poll fields
          pollQuestion: validatedPollOptions ? content.trim() : null,
          pollExpiresAt: pollExpiresAt,
          // Create poll options if present
          ...(validatedPollOptions && {
            pollOptions: {
              create: validatedPollOptions,
            },
          }),
        },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              firstName: true,
              lastName: true,
              image: true,
              slug: true,
              headline: true,
              // Include first company with logo for display next to username
              companies: {
                where: {
                  logo: { not: null },
                },
                take: 1,
                orderBy: { createdAt: "asc" },
                select: {
                  id: true,
                  name: true,
                  slug: true,
                  logo: true,
                },
              },
            },
          },
          pollOptions: {
            orderBy: { order: "asc" },
            include: {
              _count: {
                select: { votes: true },
              },
            },
          },
        },
      }),
      prisma.user.update({
        where: { id: session.user.id },
        data: {
          currentStreak: newStreak,
          longestStreak: longestStreak,
          lastActivityDate: today,
        },
      }),
    ]);

    // Award karma for posting an update
    awardKarmaForUpdate(session.user.id, update.id).catch(console.error);

    // Award karma for streak milestones (if crossing 7, 30, or 100 days)
    const previousStreak = user?.currentStreak || 0;
    if (newStreak !== previousStreak) {
      awardKarmaForStreakMilestone(session.user.id, newStreak, previousStreak).catch(console.error);
    }

    // Auto check-in for accountability partnerships (linked to this daily update)
    autoCheckInFromUpdate(session.user.id, update.id).catch(console.error);

    // Extract mentions and create notifications
    const mentionedSlugs = extractMentions(content);

    if (mentionedSlugs.length > 0) {
      // Get the current user's display name for notification
      const currentUser = await prisma.user.findUnique({
        where: { id: session.user.id },
        select: { firstName: true, lastName: true, name: true, image: true },
      });

      const actorName = currentUser?.firstName && currentUser?.lastName
        ? `${currentUser.firstName} ${currentUser.lastName}`
        : currentUser?.name || "Someone";

      // Find users by their slugs
      const mentionedUsers = await prisma.user.findMany({
        where: {
          slug: { in: mentionedSlugs },
          // Don't notify yourself
          id: { not: session.user.id },
        },
        select: { id: true, slug: true },
      });

      // Create notifications for each mentioned user
      // Note: USER_MENTIONED type added in schema - run `npx prisma generate` after migration
      if (mentionedUsers.length > 0) {
        await prisma.notification.createMany({
          data: mentionedUsers.map((user) => ({
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            type: "USER_MENTIONED" as any,
            title: `${actorName} mentioned you`,
            message: content.length > 100 ? content.slice(0, 100) + "..." : content,
            userId: user.id,
            updateId: update.id,
            actorId: session.user.id,
            actorName,
            actorImage: currentUser?.image || null,
          })),
          skipDuplicates: true,
        });

        // Send push notifications to mentioned users
        for (const user of mentionedUsers) {
          sendUserPushNotification(user.id, {
            title: 'You were mentioned',
            body: `${actorName} mentioned you in an update`,
            url: '/updates',
            tag: 'mention',
          }).catch(console.error);
        }
      }
    }

    return NextResponse.json({
      ...update,
      streak: {
        current: newStreak,
        longest: longestStreak,
      },
    }, { status: 201 });
  } catch (error) {
    console.error("Error creating update:", error);
    return NextResponse.json(
      { error: "Failed to create update" },
      { status: 500 }
    );
  }
}
