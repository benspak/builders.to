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

      // Delete user's notifications
      await tx.notification.deleteMany({ where: { userId } });

      // Delete user's feed event comments
      await tx.feedEventComment.deleteMany({ where: { userId } });

      // Delete user's feed event likes
      await tx.feedEventLike.deleteMany({ where: { userId } });

      // Delete user's feed events
      await tx.feedEvent.deleteMany({ where: { userId } });

      // Delete user's project co-builder associations
      await tx.projectCoBuilder.deleteMany({ where: { userId } });

      // Delete user's projects (and related data via cascade)
      await tx.project.deleteMany({ where: { userId } });

      // Delete user's company memberships
      await tx.companyMember.deleteMany({ where: { userId } });

      // Delete user's companies (and related data via cascade)
      await tx.company.deleteMany({ where: { userId } });

      // Delete user's service orders (as buyer)
      await tx.serviceOrder.deleteMany({ where: { buyerId: userId } });

      // Delete user's service listings
      await tx.serviceListing.deleteMany({ where: { userId } });

      // Delete user's local listing comments
      await tx.localListingComment.deleteMany({ where: { userId } });

      // Delete user's local listing flags
      await tx.localListingFlag.deleteMany({ where: { userId } });

      // Delete user's local listing ratings (both given and received)
      await tx.localListingRating.deleteMany({
        where: { OR: [{ raterId: userId }, { ratedUserId: userId }] },
      });

      // Delete user's local listings
      await tx.localListing.deleteMany({ where: { userId } });

      // Delete user's push subscriptions
      await tx.pushSubscription.deleteMany({ where: { userId } });

      // Delete user's email preferences
      await tx.emailPreferences.deleteMany({ where: { userId } });

      // Delete user's content reports (as reporter)
      await tx.report.deleteMany({ where: { reporterId: userId } });

      // Delete user's advertisements
      await tx.advertisement.deleteMany({ where: { userId } });

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
