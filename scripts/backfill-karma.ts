/**
 * Backfill Karma Script
 * 
 * This script calculates and backfills karma points for all existing users
 * based on their historical activity:
 * - Daily updates posted: +5 each
 * - Likes received on updates: +2 each
 * - Comments posted: +3 each
 * - Likes received on comments: +1 each
 * - Projects launched: +25 each
 * - Project upvotes received: +5 each
 * - Streak milestones: +10 (7-day), +25 (30-day), +50 (100-day)
 * 
 * Usage: npx ts-node scripts/backfill-karma.ts
 */

import { PrismaClient, KarmaLevel, KarmaEventType } from '@prisma/client';

const prisma = new PrismaClient();

// Karma point values
const KARMA_POINTS = {
  UPDATE_POSTED: 5,
  UPDATE_LIKED: 2,
  COMMENT_POSTED: 3,
  COMMENT_LIKED: 1,
  PROJECT_LAUNCHED: 25,
  PROJECT_UPVOTED: 5,
  STREAK_7_DAY: 10,
  STREAK_30_DAY: 25,
  STREAK_100_DAY: 50,
};

// Calculate karma level based on points
function calculateKarmaLevel(karma: number): KarmaLevel {
  if (karma >= 5000) return 'LEGEND';
  if (karma >= 2000) return 'MENTOR';
  if (karma >= 500) return 'BUILDER';
  if (karma >= 100) return 'CONTRIBUTOR';
  return 'NEWCOMER';
}

async function backfillKarma() {
  console.log('Starting karma backfill...\n');

  // Get all users
  const users = await prisma.user.findMany({
    select: { id: true, slug: true, longestStreak: true },
  });

  console.log(`Found ${users.length} users to process\n`);

  let processedCount = 0;
  let totalKarmaAwarded = 0;

  for (const user of users) {
    let userKarma = 0;
    const karmaEvents: {
      type: KarmaEventType;
      points: number;
      userId: string;
      updateId?: string;
      commentId?: string;
      projectId?: string;
    }[] = [];

    // Count daily updates
    const updateCount = await prisma.dailyUpdate.count({
      where: { userId: user.id },
    });
    if (updateCount > 0) {
      const points = updateCount * KARMA_POINTS.UPDATE_POSTED;
      userKarma += points;
      // Create a single karma event for all historical updates
      karmaEvents.push({
        type: 'UPDATE_POSTED',
        points,
        userId: user.id,
      });
    }

    // Count likes received on updates
    const updateLikesReceived = await prisma.updateLike.count({
      where: {
        update: { userId: user.id },
      },
    });
    if (updateLikesReceived > 0) {
      const points = updateLikesReceived * KARMA_POINTS.UPDATE_LIKED;
      userKarma += points;
      karmaEvents.push({
        type: 'UPDATE_LIKED',
        points,
        userId: user.id,
      });
    }

    // Count comments posted (UpdateComment + FeedEventComment + Comment)
    const updateCommentCount = await prisma.updateComment.count({
      where: { userId: user.id },
    });
    const feedEventCommentCount = await prisma.feedEventComment.count({
      where: { userId: user.id },
    });
    const projectCommentCount = await prisma.comment.count({
      where: { userId: user.id },
    });
    const totalComments = updateCommentCount + feedEventCommentCount + projectCommentCount;
    if (totalComments > 0) {
      const points = totalComments * KARMA_POINTS.COMMENT_POSTED;
      userKarma += points;
      karmaEvents.push({
        type: 'COMMENT_POSTED',
        points,
        userId: user.id,
      });
    }

    // Count likes received on comments
    const commentLikesReceived = await prisma.commentLike.count({
      where: {
        comment: { userId: user.id },
      },
    });
    if (commentLikesReceived > 0) {
      const points = commentLikesReceived * KARMA_POINTS.COMMENT_LIKED;
      userKarma += points;
      karmaEvents.push({
        type: 'COMMENT_LIKED',
        points,
        userId: user.id,
      });
    }

    // Count launched projects
    const launchedProjects = await prisma.project.count({
      where: {
        userId: user.id,
        status: 'LAUNCHED',
      },
    });
    if (launchedProjects > 0) {
      const points = launchedProjects * KARMA_POINTS.PROJECT_LAUNCHED;
      userKarma += points;
      karmaEvents.push({
        type: 'PROJECT_LAUNCHED',
        points,
        userId: user.id,
      });
    }

    // Count upvotes received on projects
    const projectUpvotesReceived = await prisma.upvote.count({
      where: {
        project: { userId: user.id },
      },
    });
    if (projectUpvotesReceived > 0) {
      const points = projectUpvotesReceived * KARMA_POINTS.PROJECT_UPVOTED;
      userKarma += points;
      karmaEvents.push({
        type: 'PROJECT_UPVOTED',
        points,
        userId: user.id,
      });
    }

    // Award streak milestones based on longest streak
    if (user.longestStreak >= 100) {
      userKarma += KARMA_POINTS.STREAK_100_DAY;
      karmaEvents.push({
        type: 'STREAK_MILESTONE',
        points: KARMA_POINTS.STREAK_100_DAY,
        userId: user.id,
      });
    }
    if (user.longestStreak >= 30) {
      userKarma += KARMA_POINTS.STREAK_30_DAY;
      karmaEvents.push({
        type: 'STREAK_MILESTONE',
        points: KARMA_POINTS.STREAK_30_DAY,
        userId: user.id,
      });
    }
    if (user.longestStreak >= 7) {
      userKarma += KARMA_POINTS.STREAK_7_DAY;
      karmaEvents.push({
        type: 'STREAK_MILESTONE',
        points: KARMA_POINTS.STREAK_7_DAY,
        userId: user.id,
      });
    }

    // Update user karma and create karma events
    if (userKarma > 0) {
      const karmaLevel = calculateKarmaLevel(userKarma);

      await prisma.$transaction([
        // Update user karma
        prisma.user.update({
          where: { id: user.id },
          data: {
            karma: userKarma,
            karmaLevel,
          },
        }),
        // Create karma events for history
        prisma.karmaEvent.createMany({
          data: karmaEvents,
        }),
      ]);

      totalKarmaAwarded += userKarma;
      console.log(`[${++processedCount}/${users.length}] ${user.slug || user.id}: ${userKarma} karma (${karmaLevel})`);
    } else {
      processedCount++;
    }
  }

  console.log('\n========================================');
  console.log('Karma backfill complete!');
  console.log(`Total users processed: ${processedCount}`);
  console.log(`Total karma awarded: ${totalKarmaAwarded}`);
  console.log('========================================\n');
}

// Run the backfill
backfillKarma()
  .catch((e) => {
    console.error('Error during karma backfill:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
