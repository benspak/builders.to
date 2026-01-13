import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { rateLimit, RATE_LIMITS, rateLimitResponse } from "@/lib/rate-limit";
import { extractMentions } from "@/lib/utils";
import { grantEngagementBonus, checkAndGrantStreakBonus } from "@/lib/tokens";

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
        videoUrl: true,
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
    // Rate limit check - use comment rate limit as a reasonable default
    const { success, reset } = rateLimit(request, RATE_LIMITS.comment);
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

    const body = await request.json();
    const { content, imageUrl, gifUrl, videoUrl } = body;

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

    // Create update and update user streak in a transaction
    const [update] = await prisma.$transaction([
      prisma.dailyUpdate.create({
        data: {
          content: content.trim(),
          imageUrl: imageUrl || null,
          gifUrl: gifUrl || null,
          videoUrl: videoUrl || null,
          userId: session.user.id,
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

    // Grant token rewards for posting an update
    let tokensEarned = 0;
    let streakMilestoneReached = false;

    try {
      // Grant engagement bonus (1 token per day, max once per day)
      const engagementGranted = await grantEngagementBonus(session.user.id);
      if (engagementGranted) {
        tokensEarned += 1;
      }

      // Check for streak milestone bonuses
      const streakResult = await checkAndGrantStreakBonus(session.user.id, newStreak);
      if (streakResult.granted && streakResult.amount) {
        tokensEarned += streakResult.amount;
        streakMilestoneReached = true;
      }
    } catch (error) {
      // Log but don't fail the update creation if token granting fails
      console.error("Error granting tokens for update:", error);
    }

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
      }
    }

    return NextResponse.json({
      ...update,
      streak: {
        current: newStreak,
        longest: longestStreak,
        milestoneReached: streakMilestoneReached,
      },
      tokens: {
        earned: tokensEarned,
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
