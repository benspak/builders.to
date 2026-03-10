import { NextRequest, NextResponse } from "next/server";
import { NotificationType } from "@prisma/client";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { rateLimit, RATE_LIMITS, rateLimitResponse } from "@/lib/rate-limit";
import { extractMentions } from "@/lib/utils";
import { sendUserPushNotification } from "@/lib/push-notifications";
import { createDailyUpdateForUser } from "@/lib/services/updates.service";
import { getSubscriptionTier, getDailyPostLimit } from "@/lib/stripe-subscription";
import { grantEarnedForPost } from "@/lib/ad-credits";
import { getAuthUserId } from "@/lib/api-key-auth";

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
    const userId = await getAuthUserId(request, session?.user?.id);

    if (!userId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Require complete profile (username and image) before posting
    const profileUser = await prisma.user.findUnique({
      where: { id: userId },
      select: { username: true, image: true },
    });
    if (!profileUser?.username || !profileUser?.image) {
      const missingFields = [];
      if (!profileUser?.username) missingFields.push("username");
      if (!profileUser?.image) missingFields.push("profile image");
      return NextResponse.json(
        {
          error: `Please complete your profile before posting. Missing: ${missingFields.join(" and ")}.`,
          code: "PROFILE_INCOMPLETE",
          missingFields,
        },
        { status: 400 }
      );
    }

    const tier = await getSubscriptionTier(userId);
    const dailyPostLimit = getDailyPostLimit(tier);

    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const todayPostCount = await prisma.dailyUpdate.count({
      where: {
        userId,
        createdAt: { gte: startOfDay },
      },
    });

    if (todayPostCount >= dailyPostLimit) {
      const limitLabel = tier === "FREE" ? "3 posts" : tier === "FOUNDERS_CIRCLE" ? "unlimited" : "20 posts";
      return NextResponse.json(
        {
          error:
            tier === "FREE"
              ? `Free members can post ${limitLabel} per day. Upgrade to Pro for up to 20 posts per day!`
              : tier === "FOUNDERS_CIRCLE"
                ? "Unexpected limit reached."
                : `You've reached your daily limit of ${limitLabel}. Come back tomorrow!`,
          code: "DAILY_LIMIT_REACHED",
          dailyLimit: dailyPostLimit,
          postsToday: todayPostCount,
          tier,
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

      try {
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
      } catch (pollErr) {
        const message = pollErr instanceof Error ? pollErr.message : "Invalid poll options";
        return NextResponse.json({ error: message }, { status: 400 });
      }
    }

    const { updateId, url: _updateUrl } = await createDailyUpdateForUser(
      userId,
      content.trim(),
      {
        imageUrl: imageUrl || null,
        gifUrl: gifUrl || null,
        pollOptions: validatedPollOptions || undefined,
      }
    );

    grantEarnedForPost(userId).catch(console.error);

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { currentStreak: true, longestStreak: true },
    });

    const update = await prisma.dailyUpdate.findUnique({
      where: { id: updateId },
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
            companies: {
              where: { logo: { not: null } },
              take: 1,
              orderBy: { createdAt: "asc" },
              select: { id: true, name: true, slug: true, logo: true },
            },
          },
        },
        pollOptions: {
          orderBy: { order: "asc" },
          include: { _count: { select: { votes: true } } },
        },
      },
    });

    if (!update) {
      console.error("[updates] createDailyUpdateForUser returned updateId but findUnique found no update:", updateId);
      return NextResponse.json(
        { error: "Update was created but could not be retrieved. Please refresh the feed." },
        { status: 500 }
      );
    }

    // Extract mentions and create notifications
    const mentionedSlugs = extractMentions(content);

    if (mentionedSlugs.length > 0) {
      // Get the current user's display name for notification
      const currentUser = await prisma.user.findUnique({
        where: { id: userId },
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
          id: { not: userId },
        },
        select: { id: true, slug: true },
      });

      // Create notifications for each mentioned user
      if (mentionedUsers.length > 0) {
        await prisma.notification.createMany({
          data: mentionedUsers.map((user) => ({
            type: NotificationType.USER_MENTIONED,
            title: `${actorName} mentioned you`,
            message: content.length > 100 ? content.slice(0, 100) + "..." : content,
            userId: user.id,
            updateId: update.id,
            actorId: userId,
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

    return NextResponse.json(
      {
        ...update,
        streak: {
          current: user?.currentStreak ?? 0,
          longest: user?.longestStreak ?? 0,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating update:", error);
    // Extract message from Error, Prisma errors, or unknown throws
    let message = "Failed to create update";
    if (error instanceof Error) {
      message = error.message;
      // Prisma errors sometimes have extra context
      const prismaErr = error as Error & { code?: string; meta?: unknown };
      if (prismaErr.code) {
        console.error("[Prisma]", prismaErr.code, prismaErr.meta);
      }
    } else if (typeof error === "object" && error !== null && "message" in error && typeof (error as { message: unknown }).message === "string") {
      message = (error as { message: string }).message;
    } else if (typeof error === "string") {
      message = error;
    } else {
      console.error("Non-Error thrown:", String(error));
    }
    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}
