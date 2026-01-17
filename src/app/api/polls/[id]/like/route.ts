import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { rateLimit, RATE_LIMITS, rateLimitResponse } from "@/lib/rate-limit";

// POST /api/polls/[id]/like - Toggle like on a poll
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Rate limit check
    const { success, reset } = rateLimit(request, RATE_LIMITS.comment);
    if (!success) {
      return rateLimitResponse(reset);
    }

    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { id: pollId } = await params;

    // Check if poll exists
    const poll = await prisma.poll.findUnique({
      where: { id: pollId },
    });

    if (!poll) {
      return NextResponse.json(
        { error: "Poll not found" },
        { status: 404 }
      );
    }

    // Check if user already liked
    const existingLike = await prisma.pollLike.findUnique({
      where: {
        userId_pollId: {
          userId: session.user.id,
          pollId,
        },
      },
    });

    let liked: boolean;

    if (existingLike) {
      // Unlike
      await prisma.pollLike.delete({
        where: { id: existingLike.id },
      });
      liked = false;
    } else {
      // Like
      await prisma.pollLike.create({
        data: {
          userId: session.user.id,
          pollId,
        },
      });
      liked = true;
    }

    // Get updated like count
    const likesCount = await prisma.pollLike.count({
      where: { pollId },
    });

    return NextResponse.json({
      liked,
      likesCount,
    });
  } catch (error) {
    console.error("Error liking poll:", error);
    return NextResponse.json(
      { error: "Failed to like poll" },
      { status: 500 }
    );
  }
}
