import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import {
  cancelProSubscription,
  updateProSubscriptionTier,
} from "@/lib/stripe-subscription";

/**
 * POST /api/pro/change-plan
 * Change subscription: select Free = cancel recurring (unless lifetime); otherwise switch to the chosen tier.
 */
export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "You must be signed in" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const tier = body.tier as string | undefined;
    const plan = body.plan as string | undefined;

    const validTiers = ["FREE", "PRO", "PREMIUM", "FOUNDERS_CIRCLE"];
    if (!tier || !validTiers.includes(tier)) {
      return NextResponse.json(
        { error: "Invalid tier. Choose FREE, PRO, PREMIUM, or FOUNDERS_CIRCLE." },
        { status: 400 }
      );
    }

    const sub = await prisma.proSubscription.findUnique({
      where: { userId: session.user.id },
      select: { plan: true, tier: true, status: true },
    });

    if (tier === "FREE") {
      if (sub?.plan === "LIFETIME") {
        return NextResponse.json(
          { error: "Lifetime memberships don't renew and can't be cancelled." },
          { status: 400 }
        );
      }
      const success = await cancelProSubscription(session.user.id);
      if (!success) {
        return NextResponse.json(
          { error: "No active subscription to cancel." },
          { status: 400 }
        );
      }
      return NextResponse.json({
        success: true,
        message: "Your subscription will end at the end of your billing period.",
      });
    }

    // Paid tier change
    if (!sub || sub.status !== "ACTIVE") {
      return NextResponse.json(
        { error: "No active subscription. Subscribe first from the plans below." },
        { status: 400 }
      );
    }

    const paidTier = tier as "PRO" | "PREMIUM" | "FOUNDERS_CIRCLE";
    const effectivePlan =
      paidTier === "PRO" && plan && ["MONTHLY", "YEARLY"].includes(plan)
        ? (plan as "MONTHLY" | "YEARLY")
        : undefined;

    const result = await updateProSubscriptionTier(
      session.user.id,
      paidTier,
      effectivePlan
    );

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || "Failed to change plan" },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Your plan has been updated. Changes may take a moment to reflect.",
    });
  } catch (error) {
    console.error("[Pro Change Plan] Error:", error);
    return NextResponse.json(
      { error: "Failed to change plan" },
      { status: 500 }
    );
  }
}
