import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import {
  cancelProSubscription,
  reactivateProSubscription,
} from "@/lib/stripe-subscription";

/**
 * POST /api/pro/cancel
 * Cancel Pro subscription at end of billing period
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

    const success = await cancelProSubscription(session.user.id);

    if (!success) {
      return NextResponse.json(
        { error: "Failed to cancel subscription. You may not have an active subscription." },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Your subscription will be cancelled at the end of the billing period",
    });
  } catch (error) {
    console.error("[Pro Cancel] Error:", error);
    return NextResponse.json(
      { error: "Failed to cancel subscription" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/pro/cancel
 * Reactivate a cancelled subscription (before period ends)
 */
export async function DELETE() {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "You must be signed in" },
        { status: 401 }
      );
    }

    const success = await reactivateProSubscription(session.user.id);

    if (!success) {
      return NextResponse.json(
        { error: "Failed to reactivate subscription" },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Your subscription has been reactivated",
    });
  } catch (error) {
    console.error("[Pro Reactivate] Error:", error);
    return NextResponse.json(
      { error: "Failed to reactivate subscription" },
      { status: 500 }
    );
  }
}
