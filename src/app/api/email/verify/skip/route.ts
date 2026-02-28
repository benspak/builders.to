import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

/**
 * POST /api/email/verify/skip
 *
 * Development only: mark the current user's email as verified without clicking the link.
 * Only available when EMAIL_DEV_MODE=true (e.g. local dev when emails aren't sent).
 */
export async function POST(request: NextRequest) {
  if (process.env.EMAIL_DEV_MODE !== "true") {
    return NextResponse.json({ error: "Not available" }, { status: 404 });
  }

  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json().catch(() => ({}));
    const email = typeof body?.email === "string" ? body.email.trim() : null;

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { email: true },
    });

    const emailToSet = email || user?.email;
    if (!emailToSet) {
      return NextResponse.json(
        { error: "Provide an email in the request body, or ensure your account has an email" },
        { status: 400 }
      );
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(emailToSet)) {
      return NextResponse.json({ error: "Invalid email format" }, { status: 400 });
    }

    const existingUser = await prisma.user.findFirst({
      where: {
        email: emailToSet,
        NOT: { id: session.user.id },
      },
    });
    if (existingUser) {
      return NextResponse.json(
        { error: "This email is already in use by another account" },
        { status: 400 }
      );
    }

    await prisma.user.update({
      where: { id: session.user.id },
      data: {
        email: emailToSet,
        emailVerified: new Date(),
      },
    });

    return NextResponse.json({
      success: true,
      message: "Email marked as verified (dev only)",
    });
  } catch (error) {
    console.error("Error skipping verification:", error);
    return NextResponse.json(
      { error: "Failed to skip verification" },
      { status: 500 }
    );
  }
}
