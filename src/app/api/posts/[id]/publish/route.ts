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

    return NextResponse.json({ post });
  } catch (error) {
    console.error("Error publishing post:", error);
    const message = error instanceof Error ? error.message : "Failed to publish post";
    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}
