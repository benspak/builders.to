import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// POST /api/updates/[id]/like - Toggle like on an update
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

    const { id: updateId } = await params;

    // Check if update exists
    const update = await prisma.dailyUpdate.findUnique({
      where: { id: updateId },
    });

    if (!update) {
      return NextResponse.json(
        { error: "Update not found" },
        { status: 404 }
      );
    }

    // Check if user already liked this update
    const existingLike = await prisma.updateLike.findUnique({
      where: {
        userId_updateId: {
          userId: session.user.id,
          updateId,
        },
      },
    });

    if (existingLike) {
      // Unlike - remove the like
      await prisma.updateLike.delete({
        where: { id: existingLike.id },
      });

      // Get updated count
      const likesCount = await prisma.updateLike.count({
        where: { updateId },
      });

      return NextResponse.json({
        liked: false,
        likesCount,
      });
    } else {
      // Like - create new like
      await prisma.updateLike.create({
        data: {
          userId: session.user.id,
          updateId,
        },
      });

      // Get updated count
      const likesCount = await prisma.updateLike.count({
        where: { updateId },
      });

      return NextResponse.json({
        liked: true,
        likesCount,
      });
    }
  } catch (error) {
    console.error("Error toggling like:", error);
    return NextResponse.json(
      { error: "Failed to toggle like" },
      { status: 500 }
    );
  }
}

// GET /api/updates/[id]/like - Get like status for an update
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    const { id: updateId } = await params;

    const likesCount = await prisma.updateLike.count({
      where: { updateId },
    });

    let isLiked = false;
    if (session?.user?.id) {
      const existingLike = await prisma.updateLike.findUnique({
        where: {
          userId_updateId: {
            userId: session.user.id,
            updateId,
          },
        },
      });
      isLiked = !!existingLike;
    }

    return NextResponse.json({
      liked: isLiked,
      likesCount,
    });
  } catch (error) {
    console.error("Error getting like status:", error);
    return NextResponse.json(
      { error: "Failed to get like status" },
      { status: 500 }
    );
  }
}
