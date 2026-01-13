import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET /api/updates/[id] - Get a single update by ID
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await auth();
    const currentUserId = session?.user?.id;

    const update = await prisma.dailyUpdate.findUnique({
      where: { id },
      select: {
        id: true,
        content: true,
        imageUrl: true,
        gifUrl: true,
        videoUrl: true,
        createdAt: true,
        updatedAt: true,
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
        likes: currentUserId
          ? {
              where: { userId: currentUserId },
              select: { id: true },
            }
          : false,
        comments: {
          orderBy: { createdAt: "asc" },
          select: {
            id: true,
            content: true,
            gifUrl: true,
            createdAt: true,
            user: {
              select: {
                id: true,
                name: true,
                displayName: true,
                firstName: true,
                lastName: true,
                image: true,
                slug: true,
              },
            },
          },
        },
      },
    });

    if (!update) {
      return NextResponse.json(
        { error: "Update not found" },
        { status: 404 }
      );
    }

    // Transform the response
    const response = {
      ...update,
      likesCount: update._count.likes,
      commentsCount: update._count.comments,
      isLiked: currentUserId ? update.likes && update.likes.length > 0 : false,
      _count: undefined,
      likes: undefined,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error("Error fetching update:", error);
    return NextResponse.json(
      { error: "Failed to fetch update" },
      { status: 500 }
    );
  }
}

// DELETE /api/updates/[id] - Delete an update
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

    const { id } = await params;

    // Find the update
    const update = await prisma.dailyUpdate.findUnique({
      where: { id },
      select: { userId: true },
    });

    if (!update) {
      return NextResponse.json(
        { error: "Update not found" },
        { status: 404 }
      );
    }

    // Only the owner can delete
    if (update.userId !== session.user.id) {
      return NextResponse.json(
        { error: "Forbidden" },
        { status: 403 }
      );
    }

    await prisma.dailyUpdate.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting update:", error);
    return NextResponse.json(
      { error: "Failed to delete update" },
      { status: 500 }
    );
  }
}
