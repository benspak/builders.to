import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getAuthUserId } from "@/lib/api-key-auth";

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

// PATCH /api/updates/[id] - Update an update (content, imageUrl, gifUrl)
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    const userId = await getAuthUserId(request, session?.user?.id);

    if (!userId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { id } = await params;

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

    if (update.userId !== userId) {
      return NextResponse.json(
        { error: "Forbidden" },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { content, imageUrl, gifUrl } = body;

    const data: { content?: string; imageUrl?: string | null; gifUrl?: string | null } = {};
    if (content !== undefined) {
      const trimmed = typeof content === "string" ? content.trim() : "";
      if (trimmed.length === 0) {
        return NextResponse.json(
          { error: "Content cannot be empty" },
          { status: 400 }
        );
      }
      if (trimmed.length > 10000) {
        return NextResponse.json(
          { error: "Content must be 10,000 characters or less" },
          { status: 400 }
        );
      }
      data.content = trimmed;
    }
    if (imageUrl !== undefined) data.imageUrl = imageUrl === null || imageUrl === "" ? null : imageUrl;
    if (gifUrl !== undefined) data.gifUrl = gifUrl === null || gifUrl === "" ? null : gifUrl;

    const updated = await prisma.dailyUpdate.update({
      where: { id },
      data,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            firstName: true,
            lastName: true,
            image: true,
            slug: true,
            headline: true,
            companies: {
              where: { logo: { not: null } },
              take: 1,
              orderBy: { createdAt: "asc" },
              select: { id: true, name: true, slug: true, logo: true },
            },
          },
        },
        pollOptions: {
          orderBy: { order: "asc" },
          include: { _count: { select: { votes: true } } },
        },
      },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Error updating update:", error);
    return NextResponse.json(
      { error: "Failed to update update" },
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
    const userId = await getAuthUserId(request, session?.user?.id);

    if (!userId) {
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
    if (update.userId !== userId) {
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
