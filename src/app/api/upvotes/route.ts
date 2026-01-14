import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { rateLimit, RATE_LIMITS, rateLimitResponse } from "@/lib/rate-limit";
import { notifyProjectUpvote } from "@/lib/push-notifications";

// POST /api/upvotes - Toggle upvote on a project
export async function POST(request: NextRequest) {
  try {
    // Rate limit check
    const { success, reset } = rateLimit(request, RATE_LIMITS.upvote);
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
    const { projectId } = body;

    if (!projectId) {
      return NextResponse.json(
        { error: "Project ID is required" },
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

    // Check if user already upvoted
    const existingUpvote = await prisma.upvote.findUnique({
      where: {
        userId_projectId: {
          userId: session.user.id,
          projectId,
        },
      },
    });

    if (existingUpvote) {
      // Remove upvote
      await prisma.upvote.delete({
        where: { id: existingUpvote.id },
      });

      const count = await prisma.upvote.count({
        where: { projectId },
      });

      return NextResponse.json({
        upvoted: false,
        count,
      });
    } else {
      // Add upvote
      await prisma.upvote.create({
        data: {
          userId: session.user.id,
          projectId,
        },
      });

      const count = await prisma.upvote.count({
        where: { projectId },
      });

      // Create notification for project owner (if not self-upvote)
      if (project.userId !== session.user.id) {
        await prisma.notification.create({
          data: {
            type: "PROJECT_UPVOTED",
            title: `${currentUser?.name || "Someone"} upvoted your project`,
            message: project.title,
            userId: project.userId,
            projectId: project.id,
            actorId: session.user.id,
            actorName: currentUser?.name,
            actorImage: currentUser?.image,
          },
        });

        // Send push notification
        const projectUrl = project.slug ? `/projects/${project.slug}` : `/projects`;
        notifyProjectUpvote(
          project.userId,
          currentUser?.name || "Someone",
          project.title,
          projectUrl
        ).catch(console.error);
      }

      return NextResponse.json({
        upvoted: true,
        count,
      });
    }
  } catch (error) {
    console.error("Error toggling upvote:", error);
    return NextResponse.json(
      { error: "Failed to toggle upvote" },
      { status: 500 }
    );
  }
}
