import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { rateLimit, RATE_LIMITS, rateLimitResponse } from "@/lib/rate-limit";

// GET /api/polls - Get polls for the feed
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");
    const limit = parseInt(searchParams.get("limit") || "20", 10);
    const cursor = searchParams.get("cursor");

    const polls = await prisma.poll.findMany({
      where: userId ? { userId } : undefined,
      orderBy: { createdAt: "desc" },
      take: Math.min(limit, 50),
      ...(cursor && {
        skip: 1,
        cursor: { id: cursor },
      }),
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

    const nextCursor = polls.length === limit ? polls[polls.length - 1]?.id : null;

    return NextResponse.json({
      polls,
      nextCursor,
    });
  } catch (error) {
    console.error("Error fetching polls:", error);
    return NextResponse.json(
      { error: "Failed to fetch polls" },
      { status: 500 }
    );
  }
}

// POST /api/polls - Create a new poll
export async function POST(request: NextRequest) {
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

    const body = await request.json();
    const { question, options } = body;

    // Validate question
    if (!question || question.trim().length === 0) {
      return NextResponse.json(
        { error: "Question is required" },
        { status: 400 }
      );
    }

    if (question.length > 280) {
      return NextResponse.json(
        { error: "Question must be 280 characters or less" },
        { status: 400 }
      );
    }

    // Validate options
    if (!options || !Array.isArray(options) || options.length < 2) {
      return NextResponse.json(
        { error: "At least 2 options are required" },
        { status: 400 }
      );
    }

    if (options.length > 5) {
      return NextResponse.json(
        { error: "Maximum 5 options allowed" },
        { status: 400 }
      );
    }

    // Validate each option
    const validatedOptions = options.map((opt: string, index: number) => {
      const text = typeof opt === "string" ? opt.trim() : "";
      if (!text || text.length === 0) {
        throw new Error(`Option ${index + 1} is empty`);
      }
      if (text.length > 50) {
        throw new Error(`Option ${index + 1} must be 50 characters or less`);
      }
      return { text, order: index };
    });

    // Calculate expiration (7 days from now)
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    // Create poll with options
    const poll = await prisma.poll.create({
      data: {
        question: question.trim(),
        expiresAt,
        userId: session.user.id,
        options: {
          create: validatedOptions,
        },
      },
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
      },
    });

    return NextResponse.json(poll, { status: 201 });
  } catch (error) {
    console.error("Error creating poll:", error);
    const message = error instanceof Error ? error.message : "Failed to create poll";
    return NextResponse.json(
      { error: message },
      { status: 400 }
    );
  }
}
