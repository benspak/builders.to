import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET /api/polls/[id] - Get a single poll
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: pollId } = await params;
    const session = await auth();

    const poll = await prisma.poll.findUnique({
      where: { id: pollId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            displayName: true,
            firstName: true,
            lastName: true,
            image: true,
            slug: true,
            headline: true,
            companies: {
              where: { logo: { not: null } },
              take: 1,
              orderBy: { createdAt: "asc" },
              select: {
                id: true,
                name: true,
                slug: true,
                logo: true,
              },
            },
          },
        },
        options: {
          orderBy: { order: "asc" },
          include: {
            _count: {
              select: { votes: true },
            },
          },
        },
        _count: {
          select: {
            likes: true,
            comments: true,
          },
        },
        likes: {
          select: { userId: true },
        },
      },
    });

    if (!poll) {
      return NextResponse.json(
        { error: "Poll not found" },
        { status: 404 }
      );
    }

    // Check if current user has voted
    let votedOptionId: string | null = null;
    if (session?.user?.id) {
      const vote = await prisma.pollVote.findUnique({
        where: {
          userId_pollId: {
            userId: session.user.id,
            pollId,
          },
        },
      });
      votedOptionId = vote?.optionId || null;
    }

    // Calculate total votes
    const totalVotes = poll.options.reduce(
      (sum, opt) => sum + opt._count.votes,
      0
    );

    return NextResponse.json({
      ...poll,
      totalVotes,
      votedOptionId,
      hasLiked: session?.user?.id
        ? poll.likes.some((like) => like.userId === session.user.id)
        : false,
    });
  } catch (error) {
    console.error("Error fetching poll:", error);
    return NextResponse.json(
      { error: "Failed to fetch poll" },
      { status: 500 }
    );
  }
}

// DELETE /api/polls/[id] - Delete a poll (owner only)
export async function DELETE(
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

    const { id: pollId } = await params;

    // Check if poll exists and user is the owner
    const poll = await prisma.poll.findUnique({
      where: { id: pollId },
      select: { userId: true },
    });

    if (!poll) {
      return NextResponse.json(
        { error: "Poll not found" },
        { status: 404 }
      );
    }

    if (poll.userId !== session.user.id) {
      return NextResponse.json(
        { error: "Not authorized to delete this poll" },
        { status: 403 }
      );
    }

    // Delete the poll (cascade deletes options, votes, likes, comments)
    await prisma.poll.delete({
      where: { id: pollId },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting poll:", error);
    return NextResponse.json(
      { error: "Failed to delete poll" },
      { status: 500 }
    );
  }
}
