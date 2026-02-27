/**
 * Karma/Reputation Service
 *
 * Handles:
 * - Awarding karma points for various actions
 * - Calculating and updating karma levels
 * - Karma leaderboard queries
 * - Karma history tracking
 * - "Mark as helpful" functionality for comments
 */

import { KarmaEventType, KarmaLevel } from "@prisma/client";
import prisma from "@/lib/prisma";
import { credit as creditTokens } from "@/lib/services/tokens.service";

// ============================================
// Constants & Types
// ============================================

// Karma point values for each action
export const KARMA_POINTS = {
  UPDATE_POSTED: 5,
  UPDATE_LIKED: 2,
  COMMENT_POSTED: 3,
  COMMENT_LIKED: 1,
  HELPFUL_COMMENT: 10,
  PROJECT_LAUNCHED: 25,
  PROJECT_UPVOTED: 5,
  STREAK_7_DAY: 10,
  STREAK_30_DAY: 25,
  STREAK_100_DAY: 50,
  PARTNERSHIP_FORMED: 15,
  MENTORSHIP_GIVEN: 20,
  SPAM_REMOVED: -10,
  VIOLATION: -25,
} as const;

// Karma level thresholds
const KARMA_THRESHOLDS = {
  NEWCOMER: 0,
  CONTRIBUTOR: 100,
  BUILDER: 500,
  MENTOR: 2000,
  LEGEND: 5000,
} as const;

export interface KarmaEventInput {
  userId: string;
  type: KarmaEventType;
  points: number;
  updateId?: string;
  commentId?: string;
  projectId?: string;
  actorId?: string;
}

export interface LeaderboardUser {
  id: string;
  slug: string | null;
  displayName: string | null;
  firstName: string | null;
  lastName: string | null;
  name: string | null;
  image: string | null;
  karma: number;
  karmaLevel: KarmaLevel;
  currentStreak: number;
}

export interface KarmaHistoryItem {
  id: string;
  type: KarmaEventType;
  points: number;
  createdAt: Date;
  actorId: string | null;
  actor?: {
    slug: string | null;
    displayName: string | null;
    firstName: string | null;
    lastName: string | null;
    name: string | null;
    image: string | null;
  } | null;
}

// ============================================
// Karma Level Calculation
// ============================================

/**
 * Calculate the appropriate karma level based on points
 */
export function calculateKarmaLevel(karma: number): KarmaLevel {
  if (karma >= KARMA_THRESHOLDS.LEGEND) return "LEGEND";
  if (karma >= KARMA_THRESHOLDS.MENTOR) return "MENTOR";
  if (karma >= KARMA_THRESHOLDS.BUILDER) return "BUILDER";
  if (karma >= KARMA_THRESHOLDS.CONTRIBUTOR) return "CONTRIBUTOR";
  return "NEWCOMER";
}

/**
 * Get the progress towards the next karma level
 */
export function getKarmaProgress(karma: number): {
  currentLevel: KarmaLevel;
  nextLevel: KarmaLevel | null;
  progress: number; // 0-100
  pointsToNext: number;
} {
  const currentLevel = calculateKarmaLevel(karma);

  const levelOrder: KarmaLevel[] = [
    "NEWCOMER",
    "CONTRIBUTOR",
    "BUILDER",
    "MENTOR",
    "LEGEND",
  ];
  const currentIndex = levelOrder.indexOf(currentLevel);

  if (currentIndex === levelOrder.length - 1) {
    // Already at max level
    return {
      currentLevel,
      nextLevel: null,
      progress: 100,
      pointsToNext: 0,
    };
  }

  const nextLevel = levelOrder[currentIndex + 1];
  const currentThreshold = KARMA_THRESHOLDS[currentLevel];
  const nextThreshold = KARMA_THRESHOLDS[nextLevel];

  const pointsInCurrentLevel = karma - currentThreshold;
  const pointsNeededForNext = nextThreshold - currentThreshold;
  const progress = Math.min(
    100,
    Math.floor((pointsInCurrentLevel / pointsNeededForNext) * 100)
  );
  const pointsToNext = nextThreshold - karma;

  return {
    currentLevel,
    nextLevel,
    progress,
    pointsToNext,
  };
}

// ============================================
// Core Karma Operations
// ============================================

/**
 * Award karma points to a user
 * Creates a karma event and updates the user's total karma
 */
export async function awardKarma(input: KarmaEventInput): Promise<{
  success: boolean;
  newKarma: number;
  newLevel: KarmaLevel;
  leveledUp: boolean;
  previousLevel?: KarmaLevel;
}> {
  const { userId, type, points, updateId, commentId, projectId, actorId } =
    input;

  // Get current user karma
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { karma: true, karmaLevel: true },
  });

  if (!user) {
    return {
      success: false,
      newKarma: 0,
      newLevel: "NEWCOMER",
      leveledUp: false,
    };
  }

  const previousLevel = user.karmaLevel;
  const newKarma = Math.max(0, user.karma + points); // Karma can't go below 0
  const newLevel = calculateKarmaLevel(newKarma);
  const leveledUp = newLevel !== previousLevel && points > 0;

  // Create karma event and update user in transaction
  await prisma.$transaction([
    prisma.karmaEvent.create({
      data: {
        userId,
        type,
        points,
        updateId,
        commentId,
        projectId,
        actorId,
      },
    }),
    prisma.user.update({
      where: { id: userId },
      data: {
        karma: newKarma,
        karmaLevel: newLevel,
      },
    }),
  ]);

  // Award engagement tokens when karma is earned (positive points only)
  if (points > 0) {
    const engagementTokens = Math.max(1, Math.floor(points / 5)); // 1 token per 5 karma, min 1
    try {
      await creditTokens({
        userId,
        amount: engagementTokens,
        type: "ENGAGEMENT_BONUS",
        description: `Karma: ${type}`,
        metadata: { karmaEventType: type, karmaPoints: points, updateId, commentId, projectId },
      });
    } catch (err) {
      console.error("[Karma] Failed to credit engagement tokens:", err);
      // Don't fail the karma award if token credit fails
    }
  }

  return {
    success: true,
    newKarma,
    newLevel,
    leveledUp,
    previousLevel: leveledUp ? previousLevel : undefined,
  };
}

/**
 * Award karma when a user posts an update
 */
export async function awardKarmaForUpdate(
  userId: string,
  updateId: string
): Promise<void> {
  await awardKarma({
    userId,
    type: "UPDATE_POSTED",
    points: KARMA_POINTS.UPDATE_POSTED,
    updateId,
  });
}

/**
 * Award karma when someone likes a user's update
 */
export async function awardKarmaForUpdateLike(
  updateOwnerId: string,
  updateId: string,
  likerId: string
): Promise<void> {
  // Don't award karma for liking your own update
  if (updateOwnerId === likerId) return;

  await awardKarma({
    userId: updateOwnerId,
    type: "UPDATE_LIKED",
    points: KARMA_POINTS.UPDATE_LIKED,
    updateId,
    actorId: likerId,
  });
}

/**
 * Award karma when a user posts a comment
 */
export async function awardKarmaForComment(
  userId: string,
  commentId: string
): Promise<void> {
  await awardKarma({
    userId,
    type: "COMMENT_POSTED",
    points: KARMA_POINTS.COMMENT_POSTED,
    commentId,
  });
}

/**
 * Award karma when someone likes a user's comment
 */
export async function awardKarmaForCommentLike(
  commentOwnerId: string,
  commentId: string,
  likerId: string
): Promise<void> {
  // Don't award karma for liking your own comment
  if (commentOwnerId === likerId) return;

  await awardKarma({
    userId: commentOwnerId,
    type: "COMMENT_LIKED",
    points: KARMA_POINTS.COMMENT_LIKED,
    commentId,
    actorId: likerId,
  });
}

/**
 * Award karma when a comment is marked as helpful
 */
export async function awardKarmaForHelpfulComment(
  commentOwnerId: string,
  commentId: string,
  markerId: string
): Promise<void> {
  // Don't award karma for marking your own comment as helpful
  if (commentOwnerId === markerId) return;

  await awardKarma({
    userId: commentOwnerId,
    type: "HELPFUL_COMMENT",
    points: KARMA_POINTS.HELPFUL_COMMENT,
    commentId,
    actorId: markerId,
  });
}

/**
 * Award karma when a project is launched
 */
export async function awardKarmaForProjectLaunch(
  userId: string,
  projectId: string
): Promise<void> {
  await awardKarma({
    userId,
    type: "PROJECT_LAUNCHED",
    points: KARMA_POINTS.PROJECT_LAUNCHED,
    projectId,
  });
}

/**
 * Award karma when someone upvotes a user's project
 */
export async function awardKarmaForProjectUpvote(
  projectOwnerId: string,
  projectId: string,
  voterId: string
): Promise<void> {
  // Don't award karma for upvoting your own project
  if (projectOwnerId === voterId) return;

  await awardKarma({
    userId: projectOwnerId,
    type: "PROJECT_UPVOTED",
    points: KARMA_POINTS.PROJECT_UPVOTED,
    projectId,
    actorId: voterId,
  });
}

/** Token amounts for streak milestones (STREAK_BONUS) */
const STREAK_BONUS_TOKENS: Record<number, number> = {
  7: 10,
  30: 25,
  100: 50,
};

/**
 * Award karma for reaching streak milestones
 */
export async function awardKarmaForStreakMilestone(
  userId: string,
  newStreak: number,
  previousStreak: number
): Promise<void> {
  // Check if we've crossed any milestone thresholds
  const milestones = [
    { days: 7, points: KARMA_POINTS.STREAK_7_DAY },
    { days: 30, points: KARMA_POINTS.STREAK_30_DAY },
    { days: 100, points: KARMA_POINTS.STREAK_100_DAY },
  ];

  for (const milestone of milestones) {
    // Award if we just crossed this milestone
    if (newStreak >= milestone.days && previousStreak < milestone.days) {
      await awardKarma({
        userId,
        type: "STREAK_MILESTONE",
        points: milestone.points,
      });
      // Award STREAK_BONUS tokens (in addition to engagement tokens from awardKarma)
      const tokens = STREAK_BONUS_TOKENS[milestone.days];
      if (tokens) {
        try {
          await creditTokens({
            userId,
            amount: tokens,
            type: "STREAK_BONUS",
            description: `${milestone.days}-day streak`,
            metadata: { streakDays: milestone.days },
          });
        } catch (err) {
          console.error("[Karma] Failed to credit streak bonus tokens:", err);
        }
      }
    }
  }
}

/**
 * Award karma when an accountability partnership is formed
 */
export async function awardKarmaForPartnership(
  requesterId: string,
  partnerId: string
): Promise<void> {
  // Award karma to both partners
  await Promise.all([
    awardKarma({
      userId: requesterId,
      type: "PARTNERSHIP_FORMED",
      points: KARMA_POINTS.PARTNERSHIP_FORMED,
      actorId: partnerId,
    }),
    awardKarma({
      userId: partnerId,
      type: "PARTNERSHIP_FORMED",
      points: KARMA_POINTS.PARTNERSHIP_FORMED,
      actorId: requesterId,
    }),
  ]);
}

/**
 * Deduct karma for spam or violations
 */
export async function deductKarmaForViolation(
  userId: string,
  type: "SPAM_REMOVED" | "VIOLATION",
  contentId?: string
): Promise<void> {
  const points =
    type === "SPAM_REMOVED" ? KARMA_POINTS.SPAM_REMOVED : KARMA_POINTS.VIOLATION;

  await awardKarma({
    userId,
    type,
    points,
    updateId: contentId,
  });
}

// ============================================
// Leaderboard
// ============================================

/**
 * Get karma leaderboard
 */
export async function getKarmaLeaderboard(options: {
  limit?: number;
  offset?: number;
}): Promise<{
  users: LeaderboardUser[];
  total: number;
}> {
  const { limit = 10, offset = 0 } = options;

  const [users, total] = await Promise.all([
    prisma.user.findMany({
      where: {
        karma: { gt: 0 },
      },
      orderBy: { karma: "desc" },
      take: limit,
      skip: offset,
      select: {
        id: true,
        slug: true,
        displayName: true,
        firstName: true,
        lastName: true,
        name: true,
        image: true,
        karma: true,
        karmaLevel: true,
        currentStreak: true,
      },
    }),
    prisma.user.count({
      where: { karma: { gt: 0 } },
    }),
  ]);

  return { users, total };
}

/**
 * Get a user's rank on the leaderboard
 */
export async function getUserKarmaRank(userId: string): Promise<number | null> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { karma: true },
  });

  if (!user || user.karma === 0) return null;

  const usersAbove = await prisma.user.count({
    where: {
      karma: { gt: user.karma },
    },
  });

  return usersAbove + 1;
}

// ============================================
// Karma History
// ============================================

/**
 * Get karma history for a user
 */
export async function getKarmaHistory(
  userId: string,
  options: {
    limit?: number;
    offset?: number;
  }
): Promise<{
  events: KarmaHistoryItem[];
  total: number;
}> {
  const { limit = 20, offset = 0 } = options;

  const [events, total] = await Promise.all([
    prisma.karmaEvent.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: limit,
      skip: offset,
      select: {
        id: true,
        type: true,
        points: true,
        createdAt: true,
        actorId: true,
      },
    }),
    prisma.karmaEvent.count({ where: { userId } }),
  ]);

  // Fetch actor details for events with actors
  const actorIds = events
    .map((e) => e.actorId)
    .filter((id): id is string => id !== null);
  
  const actors =
    actorIds.length > 0
      ? await prisma.user.findMany({
          where: { id: { in: actorIds } },
          select: {
            id: true,
            slug: true,
            displayName: true,
            firstName: true,
            lastName: true,
            name: true,
            image: true,
          },
        })
      : [];

  const actorMap = new Map(actors.map((a) => [a.id, a]));

  const eventsWithActors = events.map((event) => ({
    ...event,
    actor: event.actorId ? actorMap.get(event.actorId) || null : null,
  }));

  return { events: eventsWithActors, total };
}

/**
 * Get user's karma info
 */
export async function getUserKarmaInfo(userId: string): Promise<{
  karma: number;
  karmaLevel: KarmaLevel;
  progress: ReturnType<typeof getKarmaProgress>;
  rank: number | null;
} | null> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { karma: true, karmaLevel: true },
  });

  if (!user) return null;

  const [progress, rank] = await Promise.all([
    Promise.resolve(getKarmaProgress(user.karma)),
    getUserKarmaRank(userId),
  ]);

  return {
    karma: user.karma,
    karmaLevel: user.karmaLevel,
    progress,
    rank,
  };
}

// ============================================
// Utility Functions
// ============================================

/**
 * Get human-readable description of karma event
 */
export function getKarmaEventDescription(type: KarmaEventType): string {
  const descriptions: Record<KarmaEventType, string> = {
    UPDATE_POSTED: "Posted a daily update",
    UPDATE_LIKED: "Received a like on your update",
    COMMENT_POSTED: "Posted a comment",
    COMMENT_LIKED: "Received a like on your comment",
    HELPFUL_COMMENT: "Comment marked as helpful",
    PROJECT_LAUNCHED: "Launched a project",
    PROJECT_UPVOTED: "Received an upvote on your project",
    STREAK_MILESTONE: "Reached a streak milestone",
    PARTNERSHIP_FORMED: "Formed an accountability partnership",
    MENTORSHIP_GIVEN: "Helped another builder",
    SPAM_REMOVED: "Content removed as spam",
    VIOLATION: "Community guideline violation",
  };

  return descriptions[type] || "Karma event";
}

/**
 * Get icon name for karma level
 */
export function getKarmaLevelIcon(level: KarmaLevel): string {
  const icons: Record<KarmaLevel, string> = {
    NEWCOMER: "seedling",
    CONTRIBUTOR: "sprout",
    BUILDER: "hammer",
    MENTOR: "graduation-cap",
    LEGEND: "crown",
  };

  return icons[level];
}

/**
 * Get color for karma level
 */
export function getKarmaLevelColor(level: KarmaLevel): string {
  const colors: Record<KarmaLevel, string> = {
    NEWCOMER: "zinc",
    CONTRIBUTOR: "blue",
    BUILDER: "green",
    MENTOR: "purple",
    LEGEND: "amber",
  };

  return colors[level];
}
