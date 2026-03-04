import { prisma } from "@/lib/prisma";

const FIRST_1000_CAP = 1000;

/**
 * Determines if a user is among the first 1000 signups (by createdAt, then id for ties).
 * Works for existing users (retroactive) and new users up to the 1000 mark.
 */
export async function getFirst1000Status(
  userId: string,
  createdAt: Date
): Promise<{ isFirst1000: boolean; signupRank: number }> {
  // Count users who signed up strictly before this user:
  // (createdAt < user.createdAt) OR (createdAt = user.createdAt AND id < user.id)
  const countBefore = await prisma.user.count({
    where: {
      OR: [
        { createdAt: { lt: createdAt } },
        { createdAt, id: { lt: userId } },
      ],
    },
  });

  const signupRank = countBefore + 1;
  const isFirst1000 = signupRank <= FIRST_1000_CAP;

  return { isFirst1000, signupRank };
}
