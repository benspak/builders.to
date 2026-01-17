import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const MAX_PINNED_POSTS = 3; // Limit pinned posts per user

// GET /api/pinned-posts - Get current user's pinned posts
export async function GET(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const pinnedPosts = await prisma.pinnedPost.findMany({
      where: { userId: session.user.id },
      orderBy: { order: "asc" },
      include: {
        update: {
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
              },
            },
            _count: {
              select: {
                likes: true,
                comments: true,
              },
            },
          },
        },
      },
    });

    return NextResponse.json({ pinnedPosts });
  } catch (error) {
    console.error("Error fetching pinned posts:", error);
    return NextResponse.json(
      { error: "Failed to fetch pinned posts" },
      { status: 500 }
    );
  }
}

// POST /api/pinned-posts - Pin a post to the current user's profile
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
    const { updateId } = body;

    if (!updateId) {
      return NextResponse.json(
        { error: "Update ID is required" },
        { status: 400 }
      );
    }

    // Check if the update exists
    const update = await prisma.dailyUpdate.findUnique({
      where: { id: updateId },
      select: { id: true },
    });

    if (!update) {
      return NextResponse.json(
        { error: "Update not found" },
        { status: 404 }
      );
    }

    // Check if already pinned
    const existingPin = await prisma.pinnedPost.findUnique({
      where: {
        userId_updateId: {
          userId: session.user.id,
          updateId,
        },
      },
    });

    if (existingPin) {
      return NextResponse.json(
        { error: "Post already pinned" },
        { status: 400 }
      );
    }

    // Check current pin count
    const currentPinCount = await prisma.pinnedPost.count({
      where: { userId: session.user.id },
    });

    if (currentPinCount >= MAX_PINNED_POSTS) {
      return NextResponse.json(
        { error: `You can only pin up to ${MAX_PINNED_POSTS} posts` },
        { status: 400 }
      );
    }

    // Create pinned post with next order number
    const pinnedPost = await prisma.pinnedPost.create({
      data: {
        userId: session.user.id,
        updateId,
        order: currentPinCount, // Append to end
      },
      include: {
        update: {
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
              },
            },
            _count: {
              select: {
                likes: true,
                comments: true,
              },
            },
          },
        },
      },
    });

    return NextResponse.json({ pinnedPost });
  } catch (error) {
    console.error("Error pinning post:", error);
    return NextResponse.json(
      { error: "Failed to pin post" },
      { status: 500 }
    );
  }
}

// DELETE /api/pinned-posts - Unpin a post from the current user's profile
export async function DELETE(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const updateId = searchParams.get("updateId");

    if (!updateId) {
      return NextResponse.json(
        { error: "Update ID is required" },
        { status: 400 }
      );
    }

    // Find and delete the pinned post
    const pinnedPost = await prisma.pinnedPost.findUnique({
      where: {
        userId_updateId: {
          userId: session.user.id,
          updateId,
        },
      },
    });

    if (!pinnedPost) {
      return NextResponse.json(
        { error: "Pinned post not found" },
        { status: 404 }
      );
    }

    await prisma.pinnedPost.delete({
      where: { id: pinnedPost.id },
    });

    // Reorder remaining pinned posts
    const remainingPins = await prisma.pinnedPost.findMany({
      where: { userId: session.user.id },
      orderBy: { order: "asc" },
    });

    // Update order for remaining pins
    for (let i = 0; i < remainingPins.length; i++) {
      if (remainingPins[i].order !== i) {
        await prisma.pinnedPost.update({
          where: { id: remainingPins[i].id },
          data: { order: i },
        });
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error unpinning post:", error);
    return NextResponse.json(
      { error: "Failed to unpin post" },
      { status: 500 }
    );
  }
}
