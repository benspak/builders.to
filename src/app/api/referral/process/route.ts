import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { findUserByReferralCode } from "@/lib/tokens";
import { REFERRAL_CODE_COOKIE } from "@/middleware";

/**
 * POST /api/referral/process
 * Process a pending referral for the current user
 * Called after signup to link the referral and grant rewards
 */
export async function POST() {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "You must be signed in" },
        { status: 401 }
      );
    }

    // Get the referral code from cookie
    const cookieStore = await cookies();
    const refCode = cookieStore.get(REFERRAL_CODE_COOKIE)?.value;

    if (!refCode) {
      return NextResponse.json(
        { processed: false, message: "No pending referral" },
        { status: 200 }
      );
    }

    // Check if user already has a referrer (shouldn't process twice)
    const currentUser = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { referredById: true, name: true, createdAt: true },
    });

    if (currentUser?.referredById) {
      // Clear the cookie anyway
      cookieStore.delete(REFERRAL_CODE_COOKIE);
      return NextResponse.json(
        { processed: false, message: "Referral already processed" },
        { status: 200 }
      );
    }

    // Check if the account was created recently (within last hour)
    // This prevents abuse from users who signed up long ago
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    if (currentUser && currentUser.createdAt < oneHourAgo) {
      cookieStore.delete(REFERRAL_CODE_COOKIE);
      return NextResponse.json(
        { processed: false, message: "Account too old for referral processing" },
        { status: 200 }
      );
    }

    // Find the referrer by their code
    const referrerId = await findUserByReferralCode(refCode);

    if (!referrerId) {
      // Invalid referral code - clear cookie
      cookieStore.delete(REFERRAL_CODE_COOKIE);
      return NextResponse.json(
        { processed: false, message: "Invalid referral code" },
        { status: 200 }
      );
    }

    // Can't refer yourself
    if (referrerId === session.user.id) {
      cookieStore.delete(REFERRAL_CODE_COOKIE);
      return NextResponse.json(
        { processed: false, message: "Cannot refer yourself" },
        { status: 200 }
      );
    }

    // Link the referral (for tracking purposes)
    await prisma.user.update({
      where: { id: session.user.id },
      data: { referredById: referrerId },
    });

    // Clear the cookie
    cookieStore.delete(REFERRAL_CODE_COOKIE);

    return NextResponse.json({
      processed: true,
      message: "Referral processed successfully",
    });
  } catch (error) {
    console.error("Error processing referral:", error);
    return NextResponse.json(
      { error: "Failed to process referral" },
      { status: 500 }
    );
  }
}
