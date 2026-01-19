import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { rateLimit, RATE_LIMITS, rateLimitResponse } from "@/lib/rate-limit";

// POST /api/comment-polls/[id]/vote - Vote on a comment poll
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

    const { id: commentId } = await params;
    const body = await request.json();
    const { optionId, type } = body;

    if (!optionId) {
      return NextResponse.json(
        { error: "Option ID is required" },
        { status: 400 }
      );
    }

    // Determine which comment type this is (feed-event-comment or update-comment)
    const commentType = type === "update-comment" ? "update-comment" : "feed-event-comment";

    if (commentType === "update-comment") {
      // Handle UpdateComment poll vote
      const comment = await prisma.updateComment.findUnique({
        where: { id: commentId },
        select: {
          id: true,
          pollExpiresAt: true,
          pollOptions: {
            select: { id: true },
          },
        },
      });

      if (!comment) {
        return NextResponse.json(
          { error: "Comment not found" },
          { status: 404 }
        );
      }

      // Check if poll exists
      if (!comment.pollOptions || comment.pollOptions.length === 0) {
        return NextResponse.json(
          { error: "This comment does not have a poll" },
          { status: 400 }
        );
      }

      // Check if poll has expired
      if (comment.pollExpiresAt && new Date() > new Date(comment.pollExpiresAt)) {
        return NextResponse.json(
          { error: "This poll has ended" },
          { status: 400 }
        );
      }

      // Check if option belongs to this comment
      const validOption = comment.pollOptions.find(opt => opt.id === optionId);
      if (!validOption) {
        return NextResponse.json(
          { error: "Invalid option" },
          { status: 400 }
        );
      }

      // Check if user has already voted
      const existingVote = await prisma.updateCommentPollVote.findUnique({
        where: {
          userId_commentId: {
            userId: session.user.id,
            commentId,
          },
        },
      });

      if (existingVote) {
        return NextResponse.json(
          { error: "You have already voted on this poll" },
          { status: 400 }
        );
      }

      // Create the vote
      await prisma.updateCommentPollVote.create({
        data: {
          userId: session.user.id,
          optionId,
          commentId,
        },
      });

      // Fetch updated poll options with vote counts
      const updatedOptions = await prisma.updateCommentPollOption.findMany({
        where: { commentId },
        orderBy: { order: "asc" },
        select: {
          id: true,
          text: true,
          order: true,
          _count: {
            select: { votes: true },
          },
        },
      });

      return NextResponse.json({
        voted: true,
        optionId,
        options: updatedOptions,
      });
    } else {
      // Handle FeedEventComment poll vote
      const comment = await prisma.feedEventComment.findUnique({
        where: { id: commentId },
        select: {
          id: true,
          pollExpiresAt: true,
          pollOptions: {
            select: { id: true },
          },
        },
      });

      if (!comment) {
        return NextResponse.json(
          { error: "Comment not found" },
          { status: 404 }
        );
      }

      // Check if poll exists
      if (!comment.pollOptions || comment.pollOptions.length === 0) {
        return NextResponse.json(
          { error: "This comment does not have a poll" },
          { status: 400 }
        );
      }

      // Check if poll has expired
      if (comment.pollExpiresAt && new Date() > new Date(comment.pollExpiresAt)) {
        return NextResponse.json(
          { error: "This poll has ended" },
          { status: 400 }
        );
      }

      // Check if option belongs to this comment
      const validOption = comment.pollOptions.find(opt => opt.id === optionId);
      if (!validOption) {
        return NextResponse.json(
          { error: "Invalid option" },
          { status: 400 }
        );
      }

      // Check if user has already voted
      const existingVote = await prisma.feedEventCommentPollVote.findUnique({
        where: {
          userId_commentId: {
            userId: session.user.id,
            commentId,
          },
        },
      });

      if (existingVote) {
        return NextResponse.json(
          { error: "You have already voted on this poll" },
          { status: 400 }
        );
      }

      // Create the vote
      await prisma.feedEventCommentPollVote.create({
        data: {
          userId: session.user.id,
          optionId,
          commentId,
        },
      });

      // Fetch updated poll options with vote counts
      const updatedOptions = await prisma.feedEventCommentPollOption.findMany({
        where: { commentId },
        orderBy: { order: "asc" },
        select: {
          id: true,
          text: true,
          order: true,
          _count: {
            select: { votes: true },
          },
        },
      });

      return NextResponse.json({
        voted: true,
        optionId,
        options: updatedOptions,
      });
    }
  } catch (error) {
    console.error("Error voting on comment poll:", error);
    return NextResponse.json(
      { error: "Failed to vote" },
      { status: 500 }
    );
  }
}
