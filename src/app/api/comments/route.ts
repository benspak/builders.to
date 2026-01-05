import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { rateLimit, RATE_LIMITS, rateLimitResponse } from "@/lib/rate-limit";
import { extractMentions } from "@/lib/utils";

// GET /api/comments - Get comments for a project
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const projectId = searchParams.get("projectId");

    if (!projectId) {
      return NextResponse.json(
        { error: "Project ID is required" },
        { status: 400 }
      );
    }

    const comments = await prisma.comment.findMany({
      where: { projectId },
      orderBy: { createdAt: "desc" },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            image: true,
            slug: true,
          },
        },
      },
    });

    return NextResponse.json(comments);
  } catch (error) {
    console.error("Error fetching comments:", error);
    return NextResponse.json(
      { error: "Failed to fetch comments" },
      { status: 500 }
    );
  }
}

// POST /api/comments - Create a new comment
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
    const { projectId, content } = body;

    if (!projectId || !content) {
      return NextResponse.json(
        { error: "Project ID and content are required" },
        { status: 400 }
      );
    }

    // Check if project exists and get owner info
    const project = await prisma.project.findUnique({
      where: { id: projectId },
      select: {
        id: true,
        title: true,
        slug: true,
        userId: true,
      },
    });

    if (!project) {
      return NextResponse.json(
        { error: "Project not found" },
        { status: 404 }
      );
    }

    // Get current user info for notification
    const currentUser = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        name: true,
        image: true,
      },
    });

    const comment = await prisma.comment.create({
      data: {
        content,
        userId: session.user.id,
        projectId,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            image: true,
            slug: true,
          },
        },
      },
    });

    // Create notification for project owner (if not self-comment)
    if (project.userId !== session.user.id) {
      // Truncate comment content for notification message
      const truncatedContent = content.length > 100
        ? content.substring(0, 100) + "..."
        : content;

      await prisma.notification.create({
        data: {
          type: "PROJECT_COMMENTED",
          title: `${currentUser?.name || "Someone"} commented on your project`,
          message: truncatedContent,
          userId: project.userId,
          projectId: project.id,
          actorId: session.user.id,
          actorName: currentUser?.name,
          actorImage: currentUser?.image,
        },
      });
    }

    // Extract and process @mentions
    const mentionedSlugs = extractMentions(content);

    if (mentionedSlugs.length > 0) {
      // Find users by their slugs
      const mentionedUsers = await prisma.user.findMany({
        where: {
          slug: { in: mentionedSlugs },
          // Don't notify the commenter if they mention themselves
          id: { not: session.user.id },
        },
        select: { id: true, slug: true },
      });

      // Create notifications for mentioned users (except project owner who already got notified)
      const mentionNotifications = mentionedUsers
        .filter(user => user.id !== project.userId)
        .map(mentionedUser => ({
          type: "USER_MENTIONED" as const,
          title: `${currentUser?.name || "Someone"} mentioned you in a comment`,
          message: content.length > 100 ? content.substring(0, 100) + "..." : content,
          userId: mentionedUser.id,
          projectId: project.id,
          actorId: session.user.id,
          actorName: currentUser?.name,
          actorImage: currentUser?.image,
        }));

      if (mentionNotifications.length > 0) {
        await prisma.notification.createMany({
          data: mentionNotifications,
        });
      }
    }

    return NextResponse.json(comment, { status: 201 });
  } catch (error) {
    console.error("Error creating comment:", error);
    return NextResponse.json(
      { error: "Failed to create comment" },
      { status: 500 }
    );
  }
}
