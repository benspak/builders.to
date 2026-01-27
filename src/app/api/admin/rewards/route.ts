import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import {
  getAdminStats,
  getRewardSettings,
  updateRewardSettings,
} from "@/lib/services/rewards.service";

// Admin email whitelist - in production, use a proper admin role system
const ADMIN_EMAILS = [
  process.env.ADMIN_EMAIL,
  // Add more admin emails as needed
].filter(Boolean);

async function isAdmin(email: string | null | undefined): Promise<boolean> {
  if (!email) return false;
  return ADMIN_EMAILS.includes(email);
}

/**
 * GET /api/admin/rewards - Get admin dashboard stats and settings
 */
export async function GET(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.email || !(await isAdmin(session.user.email))) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const [stats, settings] = await Promise.all([
      getAdminStats(),
      getRewardSettings(),
    ]);

    return NextResponse.json({
      stats,
      settings,
    });
  } catch (error) {
    console.error("Error fetching admin rewards data:", error);
    return NextResponse.json(
      { error: "Failed to fetch admin data" },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/admin/rewards - Update reward settings
 */
export async function PUT(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.email || !(await isAdmin(session.user.email))) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const body = await request.json();

    // Validate settings
    const allowedFields = [
      "baseRewardCents",
      "engagementBonusCents",
      "likesPerTier",
      "maxBonusCents",
      "minCharCount",
      "maxPostsPerDay",
      "minPayoutCents",
      "globalPayoutsPaused",
    ];

    const updates: Record<string, unknown> = {};
    for (const field of allowedFields) {
      if (body[field] !== undefined) {
        updates[field] = body[field];
      }
    }

    if (Object.keys(updates).length === 0) {
      return NextResponse.json(
        { error: "No valid fields to update" },
        { status: 400 }
      );
    }

    const settings = await updateRewardSettings(updates);

    console.log(`[Admin] Settings updated by ${session.user.email}:`, updates);

    return NextResponse.json({ settings });
  } catch (error) {
    console.error("Error updating reward settings:", error);
    return NextResponse.json(
      { error: "Failed to update settings" },
      { status: 500 }
    );
  }
}
