import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { SocialPlatform } from "@prisma/client";
import { getPost, updatePost, deletePost } from "@/lib/services/posts.service";

// GET /api/posts/[id] - Get a single post
export async function GET(
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
    const post = await getPost(session.user.id, id);

    if (!post) {
      return NextResponse.json(
        { error: "Post not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ post });
  } catch (error) {
    console.error("Error fetching post:", error);
    return NextResponse.json(
      { error: "Failed to fetch post" },
      { status: 500 }
    );
  }
}

// PATCH /api/posts/[id] - Update a post
export async function PATCH(
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
    const body = await request.json();
    const { content, platforms, scheduledAt } = body;

    // Validate content if provided
    if (content !== undefined) {
      if (content.trim().length === 0) {
        return NextResponse.json(
          { error: "Content cannot be empty" },
          { status: 400 }
        );
      }
      if (content.length > 40000) {
        return NextResponse.json(
          { error: "Content must be 40,000 characters or less" },
          { status: 400 }
        );
      }
    }

    // Validate platforms if provided
    let validPlatforms: SocialPlatform[] | undefined;
    if (platforms) {
      if (!Array.isArray(platforms) || platforms.length === 0) {
        return NextResponse.json(
          { error: "At least one platform is required" },
          { status: 400 }
        );
      }

      validPlatforms = platforms.filter((p: string) =>
        Object.values(SocialPlatform).includes(p as SocialPlatform)
      );

      if (validPlatforms.length === 0) {
        return NextResponse.json(
          { error: "No valid platforms selected" },
          { status: 400 }
        );
      }
    }

    // Validate scheduled time if provided
    if (scheduledAt) {
      const scheduledDate = new Date(scheduledAt);
      if (scheduledDate < new Date()) {
        return NextResponse.json(
          { error: "Scheduled time must be in the future" },
          { status: 400 }
        );
      }
    }

    const post = await updatePost(session.user.id, id, {
      content: content?.trim(),
      platforms: validPlatforms,
      scheduledAt: scheduledAt ? new Date(scheduledAt) : undefined,
    });

    return NextResponse.json({ post });
  } catch (error) {
    console.error("Error updating post:", error);
    const message = error instanceof Error ? error.message : "Failed to update post";
    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}

// DELETE /api/posts/[id] - Delete a post
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
    const success = await deletePost(session.user.id, id);

    if (!success) {
      return NextResponse.json(
        { error: "Post not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting post:", error);
    return NextResponse.json(
      { error: "Failed to delete post" },
      { status: 500 }
    );
  }
}
