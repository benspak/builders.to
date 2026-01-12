import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getReferralCode, getReferralStats, REFERRAL_REWARD_TOKENS } from "@/lib/tokens";

/**
 * GET /api/referral
 * Get current user's referral code, link, and stats
 */
export async function GET() {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "You must be signed in" },
        { status: 401 }
      );
    }

    // Get or generate the user's referral code
    const referralCode = await getReferralCode(session.user.id);

    // Get referral stats
    const stats = await getReferralStats(session.user.id);

    // Build the referral link
    const baseUrl = process.env.NEXTAUTH_URL || "https://builders.to";
    const referralLink = `${baseUrl}?ref=${referralCode}`;

    return NextResponse.json({
      referralCode,
      referralLink,
      rewardPerReferral: REFERRAL_REWARD_TOKENS,
      stats: {
        totalReferrals: stats.totalReferrals,
        totalEarned: stats.totalEarned,
        referrals: stats.referrals.map((r) => ({
          id: r.id,
          name: r.name,
          image: r.image,
          joinedAt: r.createdAt,
        })),
      },
    });
  } catch (error) {
    console.error("Error fetching referral data:", error);
    return NextResponse.json(
      { error: "Failed to fetch referral data" },
      { status: 500 }
    );
  }
}
