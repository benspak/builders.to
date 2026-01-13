import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// POST /api/comments/[id]/like - Toggle like on a comment
// Note: FeedEventComment doesn't have likes, this is a no-op for compatibility
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

    // Check if comment exists in FeedEventComment
    const comment = await prisma.feedEventComment.findUnique({
      where: { id: commentId },
      select: { id: true },
    });

    if (!comment) {
      return NextResponse.json(
        { error: "Comment not found" },
        { status: 404 }
      );
    }

    // FeedEventComment doesn't have likes feature
    // Return a compatible response indicating no change
    return NextResponse.json({
      liked: false,
      likesCount: 0,
    });
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
    const { id: commentId } = await params;

    // Check if comment exists in FeedEventComment
    const comment = await prisma.feedEventComment.findUnique({
      where: { id: commentId },
      select: { id: true },
    });

    if (!comment) {
      return NextResponse.json(
        { error: "Comment not found" },
        { status: 404 }
      );
    }

    // FeedEventComment doesn't have likes feature
    return NextResponse.json({
      liked: false,
      likesCount: 0,
    });
  } catch (error) {
    console.error("Error getting comment like status:", error);
    return NextResponse.json(
      { error: "Failed to get like status" },
      { status: 500 }
    );
  }
}
