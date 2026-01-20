import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { sendEmail } from "@/lib/email";
import { generateVerificationEmail } from "@/lib/verification-email";
import crypto from "crypto";

/**
 * POST /api/email/verify/send
 * 
 * Sends a verification email to the user's email address.
 * Creates a verification token that expires in 24 hours.
 */
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { email } = body;

    if (!email) {
      return NextResponse.json(
        { error: "Email is required" },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: "Invalid email format" },
        { status: 400 }
      );
    }

    // Check if email is already in use by another user
    const existingUser = await prisma.user.findFirst({
      where: {
        email,
        NOT: { id: session.user.id },
      },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "This email is already in use by another account" },
        { status: 400 }
      );
    }

    // Get the current user
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { email: true, emailVerified: true },
    });

    // If the email is already verified and matches, no need to re-verify
    if (user?.email === email && user?.emailVerified) {
      return NextResponse.json(
        { error: "This email is already verified" },
        { status: 400 }
      );
    }

    // Generate a secure verification token
    const token = crypto.randomBytes(32).toString("hex");
    const expires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    // Delete any existing verification tokens for this email
    await prisma.verificationToken.deleteMany({
      where: { identifier: email },
    });

    // Create new verification token
    await prisma.verificationToken.create({
      data: {
        identifier: email,
        token,
        expires,
      },
    });

    // Store the pending email on the user (so we know what email to verify)
    // We'll use a metadata approach by including the userId in the token lookup

    // Build verification URL
    const baseUrl = process.env.NEXTAUTH_URL || "https://builders.to";
    const verificationUrl = `${baseUrl}/verify-email?token=${token}&email=${encodeURIComponent(email)}`;

    // Generate and send the email
    const { html, text } = generateVerificationEmail({
      email,
      verificationUrl,
      baseUrl,
    });

    const sent = await sendEmail({
      to: email,
      subject: "Verify your email for Builders.to",
      html,
      text,
    });

    if (!sent) {
      return NextResponse.json(
        { error: "Failed to send verification email" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Verification email sent",
    });
  } catch (error) {
    console.error("Error sending verification email:", error);
    return NextResponse.json(
      { error: "Failed to send verification email" },
      { status: 500 }
    );
  }
}
