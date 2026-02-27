import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { credit as creditTokens } from "@/lib/services/tokens.service";

const REFERRAL_REWARD_REFERRER = 25;
const REFERRAL_REWARD_REFEREE = 10;

/**
 * POST /api/referral/apply - Apply a referral code for the current user (referee)
 * Body: { code: string }
 * Awards REFERRAL_REWARD tokens to referrer and referee; sets referredById on current user.
 */
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const code = typeof body?.code === "string" ? body.code.trim() : null;
    if (!code) {
      return NextResponse.json(
        { error: "Referral code is required" },
        { status: 400 }
      );
    }

    const refereeId = session.user.id;

    const currentUser = await prisma.user.findUnique({
      where: { id: refereeId },
      select: { referredById: true },
    });
    if (!currentUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }
    if (currentUser.referredById) {
      return NextResponse.json(
        { error: "You have already used a referral code" },
        { status: 400 }
      );
    }

    const referrer = await prisma.user.findUnique({
      where: { referralCode: code },
      select: { id: true, name: true },
    });
    if (!referrer) {
      return NextResponse.json(
        { error: "Invalid referral code" },
        { status: 400 }
      );
    }
    if (referrer.id === refereeId) {
      return NextResponse.json(
        { error: "You cannot use your own referral code" },
        { status: 400 }
      );
    }

    await prisma.$transaction(async (tx) => {
      await tx.user.update({
        where: { id: refereeId },
        data: { referredById: referrer.id },
      });
    });

    // Award tokens (outside transaction so token service uses its own transaction)
    await creditTokens({
      userId: referrer.id,
      amount: REFERRAL_REWARD_REFERRER,
      type: "REFERRAL_REWARD",
      description: "Referral signup",
      metadata: { refereeId },
    });
    await creditTokens({
      userId: refereeId,
      amount: REFERRAL_REWARD_REFEREE,
      type: "REFERRAL_REWARD",
      description: "Referred by friend",
      metadata: { referrerId: referrer.id },
    });

    // Notify referrer
    await prisma.notification.create({
      data: {
        type: "TOKEN_GIFTED",
        title: "Referral reward!",
        message: `Someone signed up with your referral code. You earned ${REFERRAL_REWARD_REFERRER} tokens.`,
        userId: referrer.id,
      },
    });

    return NextResponse.json({
      success: true,
      referrerTokens: REFERRAL_REWARD_REFERRER,
      refereeTokens: REFERRAL_REWARD_REFEREE,
    });
  } catch (error) {
    console.error("[Referral] Apply error:", error);
    return NextResponse.json(
      { error: "Failed to apply referral code" },
      { status: 500 }
    );
  }
}
