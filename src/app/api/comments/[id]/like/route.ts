import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// POST /api/comments/[id]/like - Toggle like on a comment
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

    const { id: commentId } = await params;

    // Check if comment exists and get owner info
    const comment = await prisma.comment.findUnique({
      where: { id: commentId },
      select: {
        id: true,
        content: true,
        userId: true,
        projectId: true,
        project: {
          select: {
            slug: true,
            title: true,
          },
        },
      },
    });

    if (!comment) {
      return NextResponse.json(
        { error: "Comment not found" },
        { status: 404 }
      );
    }

    // Check if user already liked this comment
    const existingLike = await prisma.commentLike.findUnique({
      where: {
        userId_commentId: {
          userId: session.user.id,
          commentId,
        },
      },
    });

    if (existingLike) {
      // Unlike - remove the like
      await prisma.commentLike.delete({
        where: { id: existingLike.id },
      });

      // Get updated count
      const likesCount = await prisma.commentLike.count({
        where: { commentId },
      });

      return NextResponse.json({
        liked: false,
        likesCount,
      });
    } else {
      // Like - create new like
      await prisma.commentLike.create({
        data: {
          userId: session.user.id,
          commentId,
        },
      });

      // Get updated count
      const likesCount = await prisma.commentLike.count({
        where: { commentId },
      });

      // Create notification for the comment owner (if not liking own comment)
      if (comment.userId !== session.user.id) {
        // Get liker's info for notification
        const liker = await prisma.user.findUnique({
          where: { id: session.user.id },
          select: { name: true, firstName: true, lastName: true, image: true },
        });

        const likerName = liker?.firstName && liker?.lastName
          ? `${liker.firstName} ${liker.lastName}`
          : liker?.name || "Someone";

        // Truncate comment content for notification message
        const contentPreview = comment.content.length > 50
          ? comment.content.substring(0, 50) + "..."
          : comment.content;

        await prisma.notification.create({
          data: {
            type: "COMMENT_LIKED",
            title: `${likerName} liked your comment`,
            message: `"${contentPreview}" on ${comment.project.title}`,
            userId: comment.userId,
            projectId: comment.projectId,
            actorId: session.user.id,
            actorName: likerName,
            actorImage: liker?.image,
          },
        });
      }

      return NextResponse.json({
        liked: true,
        likesCount,
      });
    }
  } catch (error) {
    console.error("Error toggling comment like:", error);
    return NextResponse.json(
      { error: "Failed to toggle like" },
      { status: 500 }
    );
  }
}

// GET /api/comments/[id]/like - Get like status for a comment
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    const { id: commentId } = await params;

    const likesCount = await prisma.commentLike.count({
      where: { commentId },
    });

    let isLiked = false;
    if (session?.user?.id) {
      const existingLike = await prisma.commentLike.findUnique({
        where: {
          userId_commentId: {
            userId: session.user.id,
            commentId,
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
    console.error("Error getting comment like status:", error);
    return NextResponse.json(
      { error: "Failed to get like status" },
      { status: 500 }
    );
  }
}
