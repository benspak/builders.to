import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { awardKarmaForHelpfulComment } from "@/lib/services/karma.service";

// POST /api/karma/mark-helpful - Mark a comment as helpful
export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { commentId, commentOwnerId } = body;

    if (!commentId || !commentOwnerId) {
      return NextResponse.json(
        { error: "Comment ID and owner ID are required" },
        { status: 400 }
      );
    }

    // Can't mark your own comment as helpful
    if (commentOwnerId === session.user.id) {
      return NextResponse.json(
        { error: "You cannot mark your own comment as helpful" },
        { status: 400 }
      );
    }

    // Check if already marked as helpful by this user
    // We track this via KarmaEvent to prevent duplicate awards
    const existingEvent = await prisma.karmaEvent.findFirst({
      where: {
        userId: commentOwnerId,
        commentId,
        type: "HELPFUL_COMMENT",
        actorId: session.user.id,
      },
    });

    if (existingEvent) {
      return NextResponse.json(
        { error: "You have already marked this comment as helpful" },
        { status: 400 }
      );
    }

    // Award karma
    await awardKarmaForHelpfulComment(commentOwnerId, commentId, session.user.id);

    // Create notification for the comment owner
    const marker = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { name: true, firstName: true, lastName: true, image: true },
    });

    const markerName = marker?.firstName && marker?.lastName
      ? `${marker.firstName} ${marker.lastName}`
      : marker?.name || "Someone";

    await prisma.notification.create({
      data: {
        type: "COMMENT_MARKED_HELPFUL",
        title: "Your comment was marked as helpful!",
        message: `${markerName} marked your comment as helpful (+10 karma)`,
        userId: commentOwnerId,
        actorId: session.user.id,
        actorName: markerName,
        actorImage: marker?.image,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error marking comment as helpful:", error);
    return NextResponse.json(
      { error: "Failed to mark comment as helpful" },
      { status: 500 }
    );
  }
}
