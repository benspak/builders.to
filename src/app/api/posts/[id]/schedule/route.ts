import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { schedulePost } from "@/lib/services/posts.service";

// POST /api/posts/[id]/schedule - Schedule a post for later
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
    const body = await request.json();
    const { scheduledAt } = body;

    if (!scheduledAt) {
      return NextResponse.json(
        { error: "Scheduled time is required" },
        { status: 400 }
      );
    }

    const scheduledDate = new Date(scheduledAt);
    if (scheduledDate < new Date()) {
      return NextResponse.json(
        { error: "Scheduled time must be in the future" },
        { status: 400 }
      );
    }

    const post = await schedulePost(session.user.id, id, scheduledDate);

    return NextResponse.json({ post });
  } catch (error) {
    console.error("Error scheduling post:", error);
    const message = error instanceof Error ? error.message : "Failed to schedule post";
    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}
