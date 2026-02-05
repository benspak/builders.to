import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { publishPost } from "@/lib/services/posts.service";

// POST /api/posts/[id]/publish - Publish a post immediately
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

    const { id } = await params;

    const post = await publishPost(session.user.id, id);

    // Check for partial failures (some platforms succeeded, some failed)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const platformErrors = (post as any).platformErrors as Record<string, string> | undefined;
    if (platformErrors && Object.keys(platformErrors).length > 0) {
      // Return 207 Multi-Status to indicate partial success
      return NextResponse.json({
        post,
        warnings: platformErrors,
        message: `Post published but some platforms failed: ${Object.entries(platformErrors).map(([p, e]) => `${p}: ${e}`).join('; ')}`,
      }, { status: 207 });
    }

    return NextResponse.json({ post });
  } catch (error) {
    console.error("Error publishing post:", error);

    // Check if this is a cross-posting failure with attached post data
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const crossPostError = error as any;
    if (crossPostError?.post && crossPostError?.platformErrors) {
      return NextResponse.json(
        {
          error: crossPostError.message,
          post: crossPostError.post,
          platformErrors: crossPostError.platformErrors,
        },
        { status: 422 }
      );
    }

    const message = error instanceof Error ? error.message : "Failed to publish post";
    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}
