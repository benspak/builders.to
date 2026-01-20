import { prisma } from "@/lib/prisma";

/**
 * Token System - Referral Code Functions
 * 
 * The token reward system has been removed. This file now only contains
 * functions for managing referral codes, which are used for tracking
 * user referrals without monetary rewards.
 */

/**
 * Generate a unique referral code for a user
 * Format: XXXX-XXXXXX (4 chars from slug + 6 random chars)
 */
export async function generateReferralCode(userId: string): Promise<string> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { slug: true },
  });

  const prefix = user?.slug?.slice(0, 4).toUpperCase() || "USER";

  // Generate a unique code
  let code: string;
  let exists = true;

  while (exists) {
    const randomPart = Math.random().toString(36).substring(2, 8).toUpperCase();
    code = `${prefix}-${randomPart}`;

    const existing = await prisma.user.findUnique({
      where: { referralCode: code },
    });

    exists = !!existing;
  }

  // Update the user with their new referral code
  await prisma.user.update({
    where: { id: userId },
    data: { referralCode: code! },
  });

  return code!;
}

/**
 * Get a user's referral code, generating one if they don't have one
 */
export async function getReferralCode(userId: string): Promise<string> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { referralCode: true },
  });

  if (user?.referralCode) {
    return user.referralCode;
  }

  return generateReferralCode(userId);
}

/**
 * Find a user by their referral code
 */
export async function findUserByReferralCode(code: string): Promise<string | null> {
  const user = await prisma.user.findUnique({
    where: { referralCode: code.toUpperCase() },
    select: { id: true },
  });

  return user?.id || null;
}

/**
 * Get referral stats for a user (for analytics purposes)
 */
export async function getReferralStats(userId: string): Promise<{
  totalReferrals: number;
  referrals: Array<{
    id: string;
    name: string | null;
    image: string | null;
    createdAt: Date;
  }>;
}> {
  // Get users referred by this user
  const referrals = await prisma.user.findMany({
    where: { referredById: userId },
    select: {
      id: true,
      name: true,
      image: true,
      createdAt: true,
    },
    orderBy: { createdAt: "desc" },
  });

  return {
    totalReferrals: referrals.length,
    referrals,
  };
}
