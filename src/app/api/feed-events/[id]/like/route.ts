import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { notifyMilestoneCelebration } from "@/lib/push-notifications";

// POST /api/feed-events/[id]/like - Like/unlike a feed event
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

    const { id } = await params;

    // Get the feed event to check ownership and get details
    const feedEvent = await prisma.feedEvent.findUnique({
      where: { id },
      include: {
        milestone: {
          include: {
            project: {
              select: {
                id: true,
                title: true,
                userId: true,
              },
            },
          },
        },
      },
    });

    if (!feedEvent) {
      return NextResponse.json(
        { error: "Feed event not found" },
        { status: 404 }
      );
    }

    // Check if user already liked
    const existingLike = await prisma.feedEventLike.findUnique({
      where: {
        userId_feedEventId: {
          userId: session.user.id,
          feedEventId: id,
        },
      },
    });

    if (existingLike) {
      // Unlike
      await prisma.feedEventLike.delete({
        where: { id: existingLike.id },
      });

      const newCount = await prisma.feedEventLike.count({
        where: { feedEventId: id },
      });

      return NextResponse.json({
        liked: false,
        likesCount: newCount,
      });
    }

    // Like the event
    await prisma.feedEventLike.create({
      data: {
        userId: session.user.id,
        feedEventId: id,
      },
    });

    const newCount = await prisma.feedEventLike.count({
      where: { feedEventId: id },
    });

    // Create notification for the project owner (if not liking own event)
    const projectOwnerId = feedEvent.milestone?.project?.userId || feedEvent.userId;

    if (projectOwnerId !== session.user.id) {
      // Get liker's info for notification
      const liker = await prisma.user.findUnique({
        where: { id: session.user.id },
        select: { name: true, firstName: true, lastName: true, image: true },
      });

      const likerName = liker?.firstName && liker?.lastName
        ? `${liker.firstName} ${liker.lastName}`
        : liker?.name || "Someone";

      await prisma.notification.create({
        data: {
          type: "MILESTONE_LIKED",
          title: "Milestone celebrated! 🎉",
          message: `${likerName} celebrated your milestone: ${feedEvent.title}`,
          userId: projectOwnerId,
          feedEventId: id,
          actorId: session.user.id,
          actorName: likerName,
          actorImage: liker?.image,
        },
      });

      // Send push notification
      notifyMilestoneCelebration(
        projectOwnerId,
        likerName,
        feedEvent.title,
        '/feed'
      ).catch(console.error);
    }

    return NextResponse.json({
      liked: true,
      likesCount: newCount,
    });
  } catch (error) {
    console.error("Error toggling like:", error);
    return NextResponse.json(
      { error: "Failed to toggle like" },
      { status: 500 }
    );
  }
}
