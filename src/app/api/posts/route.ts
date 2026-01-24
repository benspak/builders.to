import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { SocialPlatform, CrossPostStatus } from "@prisma/client";
import { createPost, getUserPosts } from "@/lib/services/posts.service";

// GET /api/posts - Get user's posts
export async function GET(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status") as CrossPostStatus | null;
    const platform = searchParams.get("platform") as SocialPlatform | null;
    const limit = parseInt(searchParams.get("limit") || "25", 10);
    const offset = parseInt(searchParams.get("offset") || "0", 10);

    const posts = await getUserPosts(session.user.id, {
      status: status || undefined,
      platform: platform || undefined,
      limit: Math.min(limit, 50),
      offset,
    });

    return NextResponse.json({ posts });
  } catch (error) {
    console.error("Error fetching posts:", error);
    return NextResponse.json(
      { error: "Failed to fetch posts" },
      { status: 500 }
    );
  }
}

// POST /api/posts - Create a new post
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
    const { content, platforms, scheduledAt, mediaUrls } = body;

    // Validate content
    if (!content || content.trim().length === 0) {
      return NextResponse.json(
        { error: "Content is required" },
        { status: 400 }
      );
    }

    if (content.length > 40000) {
      return NextResponse.json(
        { error: "Content must be 40,000 characters or less" },
        { status: 400 }
      );
    }

    // Validate platforms
    if (!platforms || !Array.isArray(platforms) || platforms.length === 0) {
      return NextResponse.json(
        { error: "At least one platform is required" },
        { status: 400 }
      );
    }

    const validPlatforms = platforms.filter((p: string) =>
      Object.values(SocialPlatform).includes(p as SocialPlatform)
    );

    if (validPlatforms.length === 0) {
      return NextResponse.json(
        { error: "No valid platforms selected" },
        { status: 400 }
      );
    }

    // Validate scheduled time
    if (scheduledAt) {
      const scheduledDate = new Date(scheduledAt);
      if (scheduledDate < new Date()) {
        return NextResponse.json(
          { error: "Scheduled time must be in the future" },
          { status: 400 }
        );
      }
    }

    const post = await createPost(session.user.id, {
      content: content.trim(),
      platforms: validPlatforms,
      scheduledAt: scheduledAt ? new Date(scheduledAt) : undefined,
      mediaUrls,
    });

    return NextResponse.json({ post }, { status: 201 });
  } catch (error) {
    console.error("Error creating post:", error);
    const message = error instanceof Error ? error.message : "Failed to create post";
    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}
