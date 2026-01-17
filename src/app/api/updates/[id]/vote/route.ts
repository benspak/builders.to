import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { rateLimit, RATE_LIMITS, rateLimitResponse } from "@/lib/rate-limit";

// POST /api/updates/[id]/vote - Vote on an update's poll
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

    const { id: updateId } = await params;
    const body = await request.json();
    const { optionId } = body;

    if (!optionId) {
      return NextResponse.json(
        { error: "Option ID is required" },
        { status: 400 }
      );
    }

    // Check if update exists and has a poll
    const update = await prisma.dailyUpdate.findUnique({
      where: { id: updateId },
      include: {
        pollOptions: {
          select: { id: true },
        },
      },
    });

    if (!update) {
      return NextResponse.json(
        { error: "Update not found" },
        { status: 404 }
      );
    }

    if (!update.pollQuestion || update.pollOptions.length === 0) {
      return NextResponse.json(
        { error: "This update does not have a poll" },
        { status: 400 }
      );
    }

    // Check if poll is expired
    if (update.pollExpiresAt && new Date() > update.pollExpiresAt) {
      return NextResponse.json(
        { error: "This poll has ended" },
        { status: 400 }
      );
    }

    // Verify option belongs to this update's poll
    const validOption = update.pollOptions.find((opt) => opt.id === optionId);
    if (!validOption) {
      return NextResponse.json(
        { error: "Invalid option for this poll" },
        { status: 400 }
      );
    }

    // Check if user has already voted
    const existingVote = await prisma.updatePollVote.findUnique({
      where: {
        userId_updateId: {
          userId: session.user.id,
          updateId,
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
      await prisma.updatePollVote.update({
        where: { id: existingVote.id },
        data: { optionId },
      });
    } else {
      // Create new vote
      await prisma.updatePollVote.create({
        data: {
          userId: session.user.id,
          optionId,
          updateId,
        },
      });
    }

    // Return updated poll options with vote counts
    const updatedOptions = await prisma.updatePollOption.findMany({
      where: { updateId },
      orderBy: { order: "asc" },
      include: {
        _count: {
          select: { votes: true },
        },
      },
    });

    // Calculate total votes
    const totalVotes = updatedOptions.reduce(
      (sum, opt) => sum + opt._count.votes,
      0
    );

    return NextResponse.json({
      options: updatedOptions,
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

// GET /api/updates/[id]/vote - Check if user has voted
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ hasVoted: false, votedOptionId: null });
    }

    const { id: updateId } = await params;

    const vote = await prisma.updatePollVote.findUnique({
      where: {
        userId_updateId: {
          userId: session.user.id,
          updateId,
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
