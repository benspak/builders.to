import { prisma } from "@/lib/prisma";
import { awardKarmaForUpdate, awardKarmaForStreakMilestone } from "@/lib/services/karma.service";
import { autoCheckInFromUpdate } from "@/lib/services/accountability.service";

export interface CreateDailyUpdateOptions {
  imageUrl?: string | null;
  gifUrl?: string | null;
  pollOptions?: { text: string; order: number }[];
}

/**
 * Create a daily update for a user and update streak. Used by POST /api/updates and Slack slash command.
 * Does not enforce rate limits or daily post limits; caller must do that.
 */
export async function createDailyUpdateForUser(
  userId: string,
  content: string,
  options: CreateDailyUpdateOptions = {}
): Promise<{ updateId: string; url: string }> {
  const trimmed = content.trim();
  const { imageUrl, gifUrl, pollOptions } = options;

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { currentStreak: true, longestStreak: true, lastActivityDate: true },
  });

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  let newStreak = 1;
  let longestStreak = user?.longestStreak || 0;

  if (user?.lastActivityDate) {
    const lastActivity = new Date(user.lastActivityDate);
    lastActivity.setHours(0, 0, 0, 0);
    const daysDiff = Math.floor(
      (today.getTime() - lastActivity.getTime()) / (1000 * 60 * 60 * 24)
    );

    if (daysDiff === 0) {
      newStreak = user.currentStreak || 1;
    } else if (daysDiff === 1) {
      newStreak = (user.currentStreak || 0) + 1;
    }
  }

  if (newStreak > longestStreak) {
    longestStreak = newStreak;
  }

  let pollExpiresAt: Date | null = null;
  if (pollOptions && pollOptions.length > 0) {
    pollExpiresAt = new Date();
    pollExpiresAt.setDate(pollExpiresAt.getDate() + 7);
  }

  const [update] = await prisma.$transaction([
    prisma.dailyUpdate.create({
      data: {
        content: trimmed,
        imageUrl: imageUrl ?? null,
        gifUrl: gifUrl ?? null,
        userId,
        pollQuestion: pollOptions?.length ? trimmed : null,
        pollExpiresAt,
        ...(pollOptions?.length && {
          pollOptions: { create: pollOptions },
        }),
      },
    }),
    prisma.user.update({
      where: { id: userId },
      data: {
        currentStreak: newStreak,
        longestStreak: longestStreak,
        lastActivityDate: today,
      },
    }),
  ]);

  awardKarmaForUpdate(userId, update.id).catch(console.error);

  const previousStreak = user?.currentStreak || 0;
  if (newStreak !== previousStreak) {
    awardKarmaForStreakMilestone(userId, newStreak, previousStreak).catch(console.error);
  }

  autoCheckInFromUpdate(userId, update.id).catch(console.error);

  const baseUrl = process.env.NEXTAUTH_URL || "https://builders.to";
  const url = `${baseUrl}/feed#update-${update.id}`;

  return { updateId: update.id, url };
}
