import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

/**
 * DELETE /api/users/[id]/delete
 * Permanently delete a user account and all associated data
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    const { id: userId } = await params;

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Users can only delete their own account
    if (session.user.id !== userId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Verify user exists
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, email: true },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Delete all related records in the correct order to respect foreign keys
    // Using transaction to ensure all-or-nothing deletion
    await prisma.$transaction(async (tx) => {
      // Delete user's upvotes
      await tx.upvote.deleteMany({ where: { userId } });

      // Delete user's comment likes
      await tx.commentLike.deleteMany({ where: { userId } });

      // Delete user's comments
      await tx.comment.deleteMany({ where: { userId } });

      // Delete user's update likes
      await tx.updateLike.deleteMany({ where: { userId } });

      // Delete user's update comments
      await tx.updateComment.deleteMany({ where: { userId } });

      // Delete user's daily updates
      await tx.dailyUpdate.deleteMany({ where: { userId } });

      // Delete user's follows (both directions)
      await tx.follow.deleteMany({
        where: { OR: [{ followerId: userId }, { followingId: userId }] },
      });

      // Delete user's endorsements (both directions)
      await tx.endorsement.deleteMany({
        where: { OR: [{ endorserId: userId }, { endorseeId: userId }] },
      });

      // Delete user's notifications
      await tx.notification.deleteMany({ where: { userId } });

      // Delete user's feed event likes
      await tx.feedEventLike.deleteMany({ where: { userId } });

      // Delete user's feed events
      await tx.feedEvent.deleteMany({ where: { userId } });

      // Delete user's projects (and related data via cascade)
      await tx.project.deleteMany({ where: { userId } });

      // Delete user's companies (and related data via cascade)
      await tx.company.deleteMany({ where: { userId } });

      // Delete user's services
      await tx.service.deleteMany({ where: { userId } });

      // Delete user's local listings
      await tx.localListing.deleteMany({ where: { userId } });

      // Delete user's push subscriptions
      await tx.pushSubscription.deleteMany({ where: { userId } });

      // Delete user's email preferences
      await tx.emailPreferences.deleteMany({ where: { userId } });

      // Delete user's token balances
      await tx.tokenBalance.deleteMany({ where: { userId } });

      // Delete user's token transactions
      await tx.tokenTransaction.deleteMany({ where: { userId } });

      // Delete user's referral codes
      await tx.referralCode.deleteMany({ where: { userId } });

      // Delete user's content reports (as reporter)
      await tx.contentReport.deleteMany({ where: { reporterId: userId } });

      // Finally, delete the user (will cascade to Account, Session, etc.)
      await tx.user.delete({ where: { id: userId } });
    });

    return NextResponse.json({
      success: true,
      message: "Account deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting account:", error);
    return NextResponse.json(
      { error: "Failed to delete account" },
      { status: 500 }
    );
  }
}
