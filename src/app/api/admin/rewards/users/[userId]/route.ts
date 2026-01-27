import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import {
  pauseUserRewards,
  resumeUserRewards,
  flagUser,
  unflagUser,
  cancelUserPendingRewards,
  getUserEarnings,
  getUserRewards,
  getUserPayouts,
} from "@/lib/services/rewards.service";

// Admin email whitelist
const ADMIN_EMAILS = [
  process.env.ADMIN_EMAIL,
].filter(Boolean);

async function isAdmin(email: string | null | undefined): Promise<boolean> {
  if (!email) return false;
  return ADMIN_EMAILS.includes(email);
}

/**
 * GET /api/admin/rewards/users/[userId] - Get detailed earnings for a user
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const session = await auth();

    if (!session?.user?.email || !(await isAdmin(session.user.email))) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const { userId } = await params;

    const [earnings, rewardsData, payoutsData] = await Promise.all([
      getUserEarnings(userId),
      getUserRewards(userId, { limit: 50 }),
      getUserPayouts(userId, { limit: 20 }),
    ]);

    return NextResponse.json({
      earnings,
      rewards: rewardsData.rewards,
      totalRewards: rewardsData.total,
      payouts: payoutsData.payouts,
      totalPayouts: payoutsData.total,
    });
  } catch (error) {
    console.error("Error fetching user details:", error);
    return NextResponse.json(
      { error: "Failed to fetch user details" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/admin/rewards/users/[userId] - Admin actions on user
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const session = await auth();

    if (!session?.user?.email || !(await isAdmin(session.user.email))) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const { userId } = await params;
    const body = await request.json();
    const { action, reason } = body;

    if (!action) {
      return NextResponse.json(
        { error: "Action is required" },
        { status: 400 }
      );
    }

    const adminEmail = session.user.email;

    switch (action) {
      case "pause":
        await pauseUserRewards(userId, reason || `Paused by admin ${adminEmail}`);
        console.log(`[Admin] User ${userId} rewards paused by ${adminEmail}`);
        return NextResponse.json({ success: true, message: "User rewards paused" });

      case "resume":
        await resumeUserRewards(userId);
        console.log(`[Admin] User ${userId} rewards resumed by ${adminEmail}`);
        return NextResponse.json({ success: true, message: "User rewards resumed" });

      case "flag":
        if (!reason) {
          return NextResponse.json(
            { error: "Reason is required for flagging" },
            { status: 400 }
          );
        }
        await flagUser(userId, reason);
        console.log(`[Admin] User ${userId} flagged by ${adminEmail}: ${reason}`);
        return NextResponse.json({ success: true, message: "User flagged" });

      case "unflag":
        await unflagUser(userId);
        console.log(`[Admin] User ${userId} unflagged by ${adminEmail}`);
        return NextResponse.json({ success: true, message: "User unflagged" });

      case "cancelPending":
        if (!reason) {
          return NextResponse.json(
            { error: "Reason is required for cancelling rewards" },
            { status: 400 }
          );
        }
        const count = await cancelUserPendingRewards(userId, reason);
        console.log(
          `[Admin] ${count} pending rewards cancelled for user ${userId} by ${adminEmail}: ${reason}`
        );
        return NextResponse.json({
          success: true,
          message: `Cancelled ${count} pending rewards`,
        });

      default:
        return NextResponse.json(
          { error: "Invalid action" },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error("Error performing admin action:", error);
    return NextResponse.json(
      { error: "Failed to perform action" },
      { status: 500 }
    );
  }
}
