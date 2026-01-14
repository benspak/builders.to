import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { generateBackupCodes, hashBackupCode, verifyTOTPToken, decryptSecret } from "@/lib/two-factor";

// GET: Return the count of remaining backup codes
export async function GET() {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        twoFactorEnabled: true,
        twoFactorBackupCodes: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    if (!user.twoFactorEnabled) {
      return NextResponse.json(
        { error: "Two-factor authentication is not enabled" },
        { status: 400 }
      );
    }

    return NextResponse.json({
      remainingCodes: user.twoFactorBackupCodes.length,
    });
  } catch (error) {
    console.error("Error getting backup codes:", error);
    return NextResponse.json(
      { error: "Failed to get backup codes" },
      { status: 500 }
    );
  }
}

// POST: Regenerate backup codes (requires 2FA verification)
export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { code } = await request.json();

    if (!code || typeof code !== "string") {
      return NextResponse.json({ error: "Verification code is required" }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        twoFactorEnabled: true,
        twoFactorSecret: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    if (!user.twoFactorEnabled || !user.twoFactorSecret) {
      return NextResponse.json(
        { error: "Two-factor authentication is not enabled" },
        { status: 400 }
      );
    }

    // Verify the TOTP code
    const decryptedSecret = decryptSecret(user.twoFactorSecret);
    const isValid = verifyTOTPToken(decryptedSecret, code.trim());

    if (!isValid) {
      return NextResponse.json(
        { error: "Invalid verification code. Please try again." },
        { status: 400 }
      );
    }

    // Generate new backup codes
    const backupCodes = generateBackupCodes();
    const hashedBackupCodes = backupCodes.map(hashBackupCode);

    // Update the user with new backup codes
    await prisma.user.update({
      where: { id: session.user.id },
      data: { twoFactorBackupCodes: hashedBackupCodes },
    });

    return NextResponse.json({
      success: true,
      backupCodes: backupCodes,
      message: "New backup codes have been generated. Please save them securely.",
    });
  } catch (error) {
    console.error("Error regenerating backup codes:", error);
    return NextResponse.json(
      { error: "Failed to regenerate backup codes" },
      { status: 500 }
    );
  }
}
