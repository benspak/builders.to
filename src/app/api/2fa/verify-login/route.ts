import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyTOTPToken, decryptSecret, verifyBackupCode } from "@/lib/two-factor";
import { cookies } from "next/headers";

// This endpoint verifies 2FA during login
// It's called after the initial OAuth/email authentication
export async function POST(request: NextRequest) {
  try {
    const { userId, code } = await request.json();

    if (!userId || !code || typeof code !== "string") {
      return NextResponse.json(
        { error: "User ID and verification code are required" },
        { status: 400 }
      );
    }

    // Get user's 2FA setup
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        twoFactorSecret: true,
        twoFactorEnabled: true,
        twoFactorBackupCodes: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    if (!user.twoFactorEnabled || !user.twoFactorSecret) {
      return NextResponse.json(
        { error: "Two-factor authentication is not enabled for this account" },
        { status: 400 }
      );
    }

    // Try to verify as TOTP code first
    const decryptedSecret = decryptSecret(user.twoFactorSecret);
    let isValid = verifyTOTPToken(decryptedSecret, code.trim());
    let usedBackupCode = false;
    let backupCodeIndex = -1;

    // If TOTP verification failed, try backup codes
    if (!isValid) {
      const backupResult = verifyBackupCode(code.trim(), user.twoFactorBackupCodes);
      isValid = backupResult.valid;
      usedBackupCode = backupResult.valid;
      backupCodeIndex = backupResult.matchedIndex;
    }

    if (!isValid) {
      return NextResponse.json(
        { error: "Invalid verification code. Please try again." },
        { status: 400 }
      );
    }

    // If a backup code was used, remove it from the list
    if (usedBackupCode && backupCodeIndex >= 0) {
      const updatedBackupCodes = [...user.twoFactorBackupCodes];
      updatedBackupCodes.splice(backupCodeIndex, 1);

      await prisma.user.update({
        where: { id: userId },
        data: { twoFactorBackupCodes: updatedBackupCodes },
      });
    }

    // Set a cookie to indicate 2FA has been verified for this session
    const cookieStore = await cookies();
    cookieStore.set("2fa_verified", user.id, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24, // 24 hours
      path: "/",
    });

    return NextResponse.json({
      success: true,
      usedBackupCode,
      remainingBackupCodes: usedBackupCode
        ? user.twoFactorBackupCodes.length - 1
        : user.twoFactorBackupCodes.length,
    });
  } catch (error) {
    console.error("Error verifying 2FA login:", error);
    return NextResponse.json(
      { error: "Failed to verify two-factor authentication" },
      { status: 500 }
    );
  }
}
