import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { notifyLike } from "@/lib/push-notifications";
import { updateEngagementBonus } from "@/lib/services/rewards.service";
import { awardKarmaForUpdateLike } from "@/lib/services/karma.service";

// POST /api/updates/[id]/like - Toggle like on an update
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { id: updateId } = await params;

    // Check if update exists and get owner info
    const update = await prisma.dailyUpdate.findUnique({
      where: { id: updateId },
      select: {
        id: true,
        content: true,
        userId: true,
        user: {
          select: {
            slug: true,
          },
        },
      },
    });

    if (!update) {
      return NextResponse.json(
        { error: "Update not found" },
        { status: 404 }
      );
    }

    // Check if user already liked this update
    const existingLike = await prisma.updateLike.findUnique({
      where: {
        userId_updateId: {
          userId: session.user.id,
          updateId,
        },
      },
    });

    if (existingLike) {
      // Unlike - remove the like
      await prisma.updateLike.delete({
        where: { id: existingLike.id },
      });

      // Get updated count
      const likesCount = await prisma.updateLike.count({
        where: { updateId },
      });

      // Update engagement bonus (runs async, doesn't block response)
      updateEngagementBonus(updateId).catch((error) => {
        console.error("[Rewards] Error updating engagement bonus:", error);
      });

      return NextResponse.json({
        liked: false,
        likesCount,
      });
    } else {
      // Like - create new like
      await prisma.updateLike.create({
        data: {
          userId: session.user.id,
          updateId,
        },
      });

      // Get updated count
      const likesCount = await prisma.updateLike.count({
        where: { updateId },
      });

      // Create notification for the update owner (if not liking own update)
      if (update.userId !== session.user.id) {
        // Get liker's info for notification (prefer display name so we never show "Someone")
        const liker = await prisma.user.findUnique({
          where: { id: session.user.id },
          select: { name: true, firstName: true, lastName: true, displayName: true, slug: true, image: true },
        });

        const likerName =
          liker?.firstName && liker?.lastName
            ? `${liker.firstName} ${liker.lastName}`
            : liker?.displayName ||
              (liker?.slug ? `@${liker.slug}` : null) ||
              liker?.name ||
              "A builder";

        // Truncate update content for notification message
        const contentPreview = update.content.length > 50
          ? update.content.substring(0, 50) + "..."
          : update.content;

        await prisma.notification.create({
          data: {
            type: "UPDATE_LIKED",
            title: "New like on your update! ❤️",
            message: `${likerName} liked your update: "${contentPreview}"`,
            userId: update.userId,
            updateId: update.id,
            actorId: session.user.id,
            actorName: likerName,
            actorImage: liker?.image,
          },
        });

        // Send push + Slack notification (post owner gets DM when their update is liked).
        // Link to the specific post that was liked, not the liker's profile.
        const postUrl = update.user?.slug
          ? `/${update.user.slug}/updates/${update.id}`
          : "/updates";
        notifyLike(
          update.userId,
          likerName,
          contentPreview,
          postUrl
        ).catch(console.error);

        // Award karma to update owner for receiving a like
        awardKarmaForUpdateLike(update.userId, updateId, session.user.id).catch(console.error);
      }

      // Update engagement bonus (runs async, doesn't block response)
      updateEngagementBonus(updateId).catch((error) => {
        console.error("[Rewards] Error updating engagement bonus:", error);
      });

      return NextResponse.json({
        liked: true,
        likesCount,
      });
    }
  } catch (error) {
    console.error("Error toggling like:", error);
    return NextResponse.json(
      { error: "Failed to toggle like" },
      { status: 500 }
    );
  }
}

// GET /api/updates/[id]/like - Get like status for an update
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    const { id: updateId } = await params;

    const likesCount = await prisma.updateLike.count({
      where: { updateId },
    });

    let isLiked = false;
    if (session?.user?.id) {
      const existingLike = await prisma.updateLike.findUnique({
        where: {
          userId_updateId: {
            userId: session.user.id,
            updateId,
          },
        },
      });
      isLiked = !!existingLike;
    }

    return NextResponse.json({
      liked: isLiked,
      likesCount,
    });
  } catch (error) {
    console.error("Error getting like status:", error);
    return NextResponse.json(
      { error: "Failed to get like status" },
      { status: 500 }
    );
  }
}
