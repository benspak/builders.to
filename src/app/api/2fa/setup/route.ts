import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { generateTOTPSecret, generateBackupCodes, hashBackupCode, encryptSecret } from "@/lib/two-factor";
import * as QRCode from "qrcode";

export async function POST() {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get user's email for the TOTP label
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { email: true, twoFactorEnabled: true },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // If 2FA is already enabled, don't allow setup again
    if (user.twoFactorEnabled) {
      return NextResponse.json(
        { error: "Two-factor authentication is already enabled" },
        { status: 400 }
      );
    }

    // Generate a new TOTP secret
    const { secret, uri } = generateTOTPSecret(user.email);

    // Generate backup codes
    const backupCodes = generateBackupCodes();
    const hashedBackupCodes = backupCodes.map(hashBackupCode);

    // Encrypt and store the secret temporarily (not enabled yet)
    const encryptedSecret = encryptSecret(secret);

    // Store the secret (but don't enable 2FA yet - that requires verification)
    await prisma.user.update({
      where: { id: session.user.id },
      data: {
        twoFactorSecret: encryptedSecret,
        twoFactorBackupCodes: hashedBackupCodes,
      },
    });

    // Generate QR code as data URL
    const qrCodeDataUrl = await QRCode.toDataURL(uri, {
      width: 256,
      margin: 2,
      color: {
        dark: "#000000",
        light: "#ffffff",
      },
    });

    return NextResponse.json({
      qrCode: qrCodeDataUrl,
      secret: secret, // Show the secret so user can manually enter if QR doesn't work
      backupCodes: backupCodes, // Show backup codes to user (they should save these)
    });
  } catch (error) {
    console.error("Error setting up 2FA:", error);
    return NextResponse.json(
      { error: "Failed to set up two-factor authentication" },
      { status: 500 }
    );
  }
}
