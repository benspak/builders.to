import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { rateLimit, RATE_LIMITS, rateLimitResponse } from "@/lib/rate-limit";

// POST /api/polls/[id]/vote - Vote on a poll
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
    const body = await request.json();
    const { optionId } = body;

    if (!optionId) {
      return NextResponse.json(
        { error: "Option ID is required" },
        { status: 400 }
      );
    }

    // Check if poll exists and is not expired
    const poll = await prisma.poll.findUnique({
      where: { id: pollId },
      include: {
        options: {
          select: { id: true },
        },
      },
    });

    if (!poll) {
      return NextResponse.json(
        { error: "Poll not found" },
        { status: 404 }
      );
    }

    // Check if poll is expired
    if (new Date() > poll.expiresAt) {
      return NextResponse.json(
        { error: "This poll has ended" },
        { status: 400 }
      );
    }

    // Verify option belongs to this poll
    const validOption = poll.options.find((opt) => opt.id === optionId);
    if (!validOption) {
      return NextResponse.json(
        { error: "Invalid option for this poll" },
        { status: 400 }
      );
    }

    // Check if user has already voted
    const existingVote = await prisma.pollVote.findUnique({
      where: {
        userId_pollId: {
          userId: session.user.id,
          pollId,
        },
      },
    });

    if (existingVote) {
      // Update existing vote if they voted for a different option
      if (existingVote.optionId === optionId) {
        return NextResponse.json(
          { error: "You have already voted for this option" },
          { status: 400 }
        );
      }

      // Update vote to new option
      await prisma.pollVote.update({
        where: { id: existingVote.id },
        data: { optionId },
      });
    } else {
      // Create new vote
      await prisma.pollVote.create({
        data: {
          userId: session.user.id,
          optionId,
          pollId,
        },
      });
    }

    // Return updated poll with vote counts
    const updatedPoll = await prisma.poll.findUnique({
      where: { id: pollId },
      include: {
        options: {
          orderBy: { order: "asc" },
          include: {
            _count: {
              select: { votes: true },
            },
          },
        },
      },
    });

    // Calculate total votes
    const totalVotes = updatedPoll?.options.reduce(
      (sum, opt) => sum + opt._count.votes,
      0
    ) || 0;

    return NextResponse.json({
      poll: updatedPoll,
      totalVotes,
      votedOptionId: optionId,
    });
  } catch (error) {
    console.error("Error voting on poll:", error);
    return NextResponse.json(
      { error: "Failed to vote" },
      { status: 500 }
    );
  }
}

// GET /api/polls/[id]/vote - Check if user has voted
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ hasVoted: false, votedOptionId: null });
    }

    const { id: pollId } = await params;

    const vote = await prisma.pollVote.findUnique({
      where: {
        userId_pollId: {
          userId: session.user.id,
          pollId,
        },
      },
    });

    return NextResponse.json({
      hasVoted: !!vote,
      votedOptionId: vote?.optionId || null,
    });
  } catch (error) {
    console.error("Error checking vote:", error);
    return NextResponse.json(
      { error: "Failed to check vote" },
      { status: 500 }
    );
  }
}
