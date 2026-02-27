import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const REFERRAL_CODE_CHARS = "abcdefghjkmnpqrstuvwxyz23456789";

function generateCode(): string {
  let code = "";
  for (let i = 0; i < 8; i++) {
    code += REFERRAL_CODE_CHARS[Math.floor(Math.random() * REFERRAL_CODE_CHARS.length)];
  }
  return code;
}

/**
 * GET /api/referral - Get current user's referral code and link (lazy-generate if missing)
 */
export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    let user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { referralCode: true },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Lazy-generate referral code for existing users who don't have one
    if (!user.referralCode) {
      let code: string | null = null;
      for (let i = 0; i < 15; i++) {
        const candidate = generateCode();
        const exists = await prisma.user.findUnique({
          where: { referralCode: candidate },
          select: { id: true },
        });
        if (!exists) {
          code = candidate;
          break;
        }
      }
      if (!code) {
        code = `ref-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`;
      }
      await prisma.user.update({
        where: { id: session.user.id },
        data: { referralCode: code },
      });
      user = { referralCode: code };
    }

    const baseUrl = process.env.NEXTAUTH_URL || "https://builders.to";
    const referralLink = `${baseUrl}/signin?ref=${user.referralCode}`;

    return NextResponse.json({
      code: user.referralCode,
      link: referralLink,
    });
  } catch (error) {
    console.warn("[Referral] GET failed (run token migrations?):", error);
    return NextResponse.json(
      { code: null, link: null },
      { status: 200 }
    );
  }
}
