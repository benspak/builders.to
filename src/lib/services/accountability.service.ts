/**
 * Accountability Partners Service
 *
 * Handles:
 * - Creating and managing partnerships
 * - Recording check-ins
 * - Notifications for check-ins and reminders
 * - Partnership statistics
 */

import { PartnershipStatus, CheckInFrequency, CheckInMood } from "@prisma/client";
import prisma from "@/lib/prisma";
import { awardKarmaForPartnership } from "./karma.service";

// ============================================
// Types
// ============================================

export interface PartnershipInput {
  requesterId: string;
  partnerId: string;
  goal?: string;
  checkInFrequency?: CheckInFrequency;
  endDate?: Date;
}

export interface CheckInInput {
  partnershipId: string;
  userId: string;
  note: string; // Required message for accountability updates
  mood?: CheckInMood;
  imageUrl?: string; // Optional image attachment
  dailyUpdateId?: string; // Link to the social feed DailyUpdate
}

export interface PartnershipWithDetails {
  id: string;
  status: PartnershipStatus;
  checkInFrequency: CheckInFrequency;
  goal: string | null;
  startDate: Date;
  endDate: Date | null;
  createdAt: Date;
  requester: {
    id: string;
    slug: string | null;
    displayName: string | null;
    firstName: string | null;
    lastName: string | null;
    name: string | null;
    image: string | null;
    currentStreak: number;
  };
  partner: {
    id: string;
    slug: string | null;
    displayName: string | null;
    firstName: string | null;
    lastName: string | null;
    name: string | null;
    image: string | null;
    currentStreak: number;
  };
  _count: {
    checkIns: number;
  };
  recentCheckIns?: {
    id: string;
    userId: string;
    note: string | null;
    mood: CheckInMood | null;
    createdAt: Date;
  }[];
}

// ============================================
// Partnership Management
// ============================================

/**
 * Send a partnership request
 */
export async function createPartnershipRequest(
  input: PartnershipInput
): Promise<{ success: boolean; partnershipId?: string; error?: string }> {
  const { requesterId, partnerId, goal, checkInFrequency, endDate } = input;

  // Can't request partnership with yourself
  if (requesterId === partnerId) {
    return { success: false, error: "Cannot request partnership with yourself" };
  }

  // Check if partnership already exists (in either direction)
  const existing = await prisma.accountabilityPartnership.findFirst({
    where: {
      OR: [
        { requesterId, partnerId },
        { requesterId: partnerId, partnerId: requesterId },
      ],
      status: { in: ["PENDING", "ACTIVE"] },
    },
  });

  if (existing) {
    return { success: false, error: "Partnership already exists" };
  }

  // Check for a previously ended partnership between these users.
  // The @@unique([requesterId, partnerId]) constraint prevents creating a
  // duplicate record, so we reuse the ended one by updating it to PENDING.
  const endedPartnership = await prisma.accountabilityPartnership.findFirst({
    where: {
      OR: [
        { requesterId, partnerId },
        { requesterId: partnerId, partnerId: requesterId },
      ],
      status: "ENDED",
    },
  });

  if (endedPartnership) {
    // Reuse the ended partnership record with fresh settings
    const partnership = await prisma.accountabilityPartnership.update({
      where: { id: endedPartnership.id },
      data: {
        requesterId,
        partnerId,
        goal: goal || null,
        checkInFrequency: checkInFrequency || "DAILY",
        endDate: endDate || null,
        status: "PENDING",
        startDate: new Date(),
      },
    });

    return { success: true, partnershipId: partnership.id };
  }

  // Create the partnership request
  const partnership = await prisma.accountabilityPartnership.create({
    data: {
      requesterId,
      partnerId,
      goal: goal || null,
      checkInFrequency: checkInFrequency || "DAILY",
      endDate: endDate || null,
      status: "PENDING",
    },
  });

  return { success: true, partnershipId: partnership.id };
}

/**
 * Respond to a partnership request
 */
export async function respondToPartnership(
  partnershipId: string,
  userId: string,
  accept: boolean
): Promise<{ success: boolean; error?: string }> {
  // Get the partnership
  const partnership = await prisma.accountabilityPartnership.findUnique({
    where: { id: partnershipId },
  });

  if (!partnership) {
    return { success: false, error: "Partnership not found" };
  }

  // Only the recipient can respond
  if (partnership.partnerId !== userId) {
    return { success: false, error: "Not authorized to respond to this request" };
  }

  // Can only respond to pending requests
  if (partnership.status !== "PENDING") {
    return { success: false, error: "Partnership is not pending" };
  }

  if (accept) {
    // Accept the partnership
    await prisma.accountabilityPartnership.update({
      where: { id: partnershipId },
      data: {
        status: "ACTIVE",
        startDate: new Date(),
      },
    });

    // Award karma to both users
    await awardKarmaForPartnership(partnership.requesterId, partnership.partnerId);

    return { success: true };
  } else {
    // Decline - set to ended
    await prisma.accountabilityPartnership.update({
      where: { id: partnershipId },
      data: { status: "ENDED" },
    });

    return { success: true };
  }
}

/**
 * Update partnership settings
 */
export async function updatePartnership(
  partnershipId: string,
  userId: string,
  updates: {
    status?: PartnershipStatus;
    checkInFrequency?: CheckInFrequency;
    goal?: string;
    endDate?: Date | null;
  }
): Promise<{ success: boolean; error?: string }> {
  // Get the partnership
  const partnership = await prisma.accountabilityPartnership.findUnique({
    where: { id: partnershipId },
  });

  if (!partnership) {
    return { success: false, error: "Partnership not found" };
  }

  // Only partners can update
  if (partnership.requesterId !== userId && partnership.partnerId !== userId) {
    return { success: false, error: "Not authorized to update this partnership" };
  }

  await prisma.accountabilityPartnership.update({
    where: { id: partnershipId },
    data: updates,
  });

  return { success: true };
}

/**
 * Get user's partnerships
 */
export async function getUserPartnerships(
  userId: string,
  options: {
    status?: PartnershipStatus | PartnershipStatus[];
    limit?: number;
    offset?: number;
  } = {}
): Promise<{
  partnerships: PartnershipWithDetails[];
  total: number;
}> {
  const { status, limit = 20, offset = 0 } = options;

  const where = {
    OR: [{ requesterId: userId }, { partnerId: userId }],
    ...(status && {
      status: Array.isArray(status) ? { in: status } : status,
    }),
  };

  const [partnerships, total] = await Promise.all([
    prisma.accountabilityPartnership.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take: limit,
      skip: offset,
      include: {
        requester: {
          select: {
            id: true,
            slug: true,
            displayName: true,
            firstName: true,
            lastName: true,
            name: true,
            image: true,
            currentStreak: true,
          },
        },
        partner: {
          select: {
            id: true,
            slug: true,
            displayName: true,
            firstName: true,
            lastName: true,
            name: true,
            image: true,
            currentStreak: true,
          },
        },
        _count: {
          select: { checkIns: true },
        },
        checkIns: {
          orderBy: { createdAt: "desc" },
          take: 5,
          select: {
            id: true,
            userId: true,
            note: true,
            mood: true,
            createdAt: true,
          },
        },
      },
    }),
    prisma.accountabilityPartnership.count({ where }),
  ]);

  return {
    partnerships: partnerships.map((p) => ({
      ...p,
      recentCheckIns: p.checkIns,
    })),
    total,
  };
}

/**
 * Get partnership by ID
 */
export async function getPartnership(
  partnershipId: string
): Promise<PartnershipWithDetails | null> {
  const partnership = await prisma.accountabilityPartnership.findUnique({
    where: { id: partnershipId },
    include: {
      requester: {
        select: {
          id: true,
          slug: true,
          displayName: true,
          firstName: true,
          lastName: true,
          name: true,
          image: true,
          currentStreak: true,
        },
      },
      partner: {
        select: {
          id: true,
          slug: true,
          displayName: true,
          firstName: true,
          lastName: true,
          name: true,
          image: true,
          currentStreak: true,
        },
      },
      _count: {
        select: { checkIns: true },
      },
      checkIns: {
        orderBy: { createdAt: "desc" },
        take: 10,
        select: {
          id: true,
          userId: true,
          note: true,
          mood: true,
          createdAt: true,
        },
      },
    },
  });

  if (!partnership) return null;

  return {
    ...partnership,
    recentCheckIns: partnership.checkIns,
  };
}

// ============================================
// Check-ins
// ============================================

/**
 * Record a check-in for a partnership
 */
export async function createCheckIn(
  input: CheckInInput
): Promise<{ success: boolean; checkInId?: string; error?: string }> {
  const { partnershipId, userId, note, mood, dailyUpdateId } = input;

  // Get the partnership
  const partnership = await prisma.accountabilityPartnership.findUnique({
    where: { id: partnershipId },
  });

  if (!partnership) {
    return { success: false, error: "Partnership not found" };
  }

  // Only partners can check in
  if (partnership.requesterId !== userId && partnership.partnerId !== userId) {
    return { success: false, error: "Not authorized to check in" };
  }

  // Partnership must be active
  if (partnership.status !== "ACTIVE") {
    return { success: false, error: "Partnership is not active" };
  }

  // Check if already checked in today
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const existingCheckIn = await prisma.accountabilityCheckIn.findFirst({
    where: {
      partnershipId,
      userId,
      createdAt: { gte: today },
    },
  });

  if (existingCheckIn) {
    return { success: false, error: "Already checked in today" };
  }

  // Create the check-in
  const checkIn = await prisma.accountabilityCheckIn.create({
    data: {
      partnershipId,
      userId,
      note: note || null,
      mood: mood || null,
      dailyUpdateId: dailyUpdateId || null,
    },
  });

  return { success: true, checkInId: checkIn.id };
}

/**
 * Get check-ins for a partnership
 */
export async function getPartnershipCheckIns(
  partnershipId: string,
  options: {
    limit?: number;
    offset?: number;
  } = {}
): Promise<{
  checkIns: {
    id: string;
    userId: string;
    note: string | null;
    mood: CheckInMood | null;
    createdAt: Date;
    user: {
      id: string;
      slug: string | null;
      displayName: string | null;
      firstName: string | null;
      lastName: string | null;
      name: string | null;
      image: string | null;
    };
  }[];
  total: number;
}> {
  const { limit = 20, offset = 0 } = options;

  const [checkIns, total] = await Promise.all([
    prisma.accountabilityCheckIn.findMany({
      where: { partnershipId },
      orderBy: { createdAt: "desc" },
      take: limit,
      skip: offset,
      include: {
        user: {
          select: {
            id: true,
            slug: true,
            displayName: true,
            firstName: true,
            lastName: true,
            name: true,
            image: true,
          },
        },
      },
    }),
    prisma.accountabilityCheckIn.count({ where: { partnershipId } }),
  ]);

  return { checkIns, total };
}

/**
 * Auto-create check-in when user posts a daily update
 * Called from the updates API
 */
export async function autoCheckInFromUpdate(userId: string): Promise<void> {
  // Get active partnerships for this user
  const partnerships = await prisma.accountabilityPartnership.findMany({
    where: {
      OR: [{ requesterId: userId }, { partnerId: userId }],
      status: "ACTIVE",
    },
  });

  if (partnerships.length === 0) return;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Create check-ins for each partnership (if not already checked in)
  for (const partnership of partnerships) {
    const existing = await prisma.accountabilityCheckIn.findFirst({
      where: {
        partnershipId: partnership.id,
        userId,
        createdAt: { gte: today },
      },
    });

    if (!existing) {
      await prisma.accountabilityCheckIn.create({
        data: {
          partnershipId: partnership.id,
          userId,
          note: "Checked in via daily update",
        },
      });
    }
  }
}

// ============================================
// Public Check-in Feed
// ============================================

/**
 * Get recent check-ins across all partnerships (public feed)
 */
export async function getRecentPublicCheckIns(
  options: {
    limit?: number;
    offset?: number;
    currentUserId?: string;
  } = {}
): Promise<{
  checkIns: {
    id: string;
    userId: string;
    note: string | null;
    mood: CheckInMood | null;
    createdAt: Date;
    dailyUpdateId: string | null;
    user: {
      id: string;
      slug: string | null;
      displayName: string | null;
      firstName: string | null;
      lastName: string | null;
      name: string | null;
      image: string | null;
      currentStreak: number;
    };
    dailyUpdate: {
      id: string;
      content: string;
      imageUrl: string | null;
      gifUrl: string | null;
      createdAt: Date;
      user: {
        id: string;
        name: string | null;
        firstName: string | null;
        lastName: string | null;
        image: string | null;
        slug: string | null;
        headline: string | null;
        companies: {
          id: string;
          name: string;
          slug: string | null;
          logo: string | null;
        }[];
      };
      _count: {
        likes: number;
        comments: number;
      };
      likes: { userId: string }[];
    } | null;
  }[];
  total: number;
}> {
  const { limit = 30, offset = 0 } = options;

  const [checkIns, total] = await Promise.all([
    prisma.accountabilityCheckIn.findMany({
      where: {
        partnership: {
          status: "ACTIVE",
        },
      },
      orderBy: { createdAt: "desc" },
      take: limit,
      skip: offset,
      include: {
        user: {
          select: {
            id: true,
            slug: true,
            displayName: true,
            firstName: true,
            lastName: true,
            name: true,
            image: true,
            currentStreak: true,
          },
        },
        dailyUpdate: {
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
                companies: {
                  where: { logo: { not: null } },
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
            likes: {
              select: { userId: true },
            },
            _count: {
              select: {
                likes: true,
                comments: true,
              },
            },
          },
        },
      },
    }),
    prisma.accountabilityCheckIn.count({
      where: {
        partnership: {
          status: "ACTIVE",
        },
      },
    }),
  ]);

  return { checkIns, total };
}

// ============================================
// Statistics
// ============================================

/**
 * Get partnership statistics
 */
export async function getPartnershipStats(
  partnershipId: string
): Promise<{
  totalCheckIns: number;
  requesterCheckIns: number;
  partnerCheckIns: number;
  currentStreak: number;
  longestStreak: number;
} | null> {
  const partnership = await prisma.accountabilityPartnership.findUnique({
    where: { id: partnershipId },
    include: {
      checkIns: {
        orderBy: { createdAt: "asc" },
        select: { userId: true, createdAt: true },
      },
    },
  });

  if (!partnership) return null;

  const totalCheckIns = partnership.checkIns.length;
  const requesterCheckIns = partnership.checkIns.filter(
    (c) => c.userId === partnership.requesterId
  ).length;
  const partnerCheckIns = partnership.checkIns.filter(
    (c) => c.userId === partnership.partnerId
  ).length;

  // Calculate streaks (days where both partners checked in)
  const checkInsByDate = new Map<string, Set<string>>();
  for (const checkIn of partnership.checkIns) {
    const dateKey = checkIn.createdAt.toISOString().split("T")[0];
    if (!checkInsByDate.has(dateKey)) {
      checkInsByDate.set(dateKey, new Set());
    }
    checkInsByDate.get(dateKey)!.add(checkIn.userId);
  }

  // Find days where both partners checked in
  const bothCheckedInDates: string[] = [];
  for (const [date, users] of checkInsByDate) {
    if (
      users.has(partnership.requesterId) &&
      users.has(partnership.partnerId)
    ) {
      bothCheckedInDates.push(date);
    }
  }

  bothCheckedInDates.sort();

  // Calculate current and longest streaks
  let currentStreak = 0;
  let longestStreak = 0;
  let tempStreak = 0;

  for (let i = 0; i < bothCheckedInDates.length; i++) {
    const currentDate = new Date(bothCheckedInDates[i]);
    const prevDate = i > 0 ? new Date(bothCheckedInDates[i - 1]) : null;

    if (prevDate) {
      const diffDays = Math.floor(
        (currentDate.getTime() - prevDate.getTime()) / (1000 * 60 * 60 * 24)
      );

      if (diffDays === 1) {
        tempStreak++;
      } else {
        longestStreak = Math.max(longestStreak, tempStreak);
        tempStreak = 1;
      }
    } else {
      tempStreak = 1;
    }
  }

  longestStreak = Math.max(longestStreak, tempStreak);

  // Check if current streak is still active (last check-in was yesterday or today)
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  const lastCheckInDate = bothCheckedInDates[bothCheckedInDates.length - 1];
  if (lastCheckInDate) {
    const lastDate = new Date(lastCheckInDate);
    if (lastDate >= yesterday) {
      currentStreak = tempStreak;
    }
  }

  return {
    totalCheckIns,
    requesterCheckIns,
    partnerCheckIns,
    currentStreak,
    longestStreak,
  };
}
