import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { rejectSuggestion } from "@/lib/services/agent.service";

// POST /api/agent/suggestions/[id]/reject - Reject a suggestion
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
    
    let reason: string | undefined;
    try {
      const body = await request.json();
      reason = body.reason;
    } catch {
      // No body or invalid JSON is fine
    }

    const suggestion = await rejectSuggestion(session.user.id, id, reason);

    return NextResponse.json({ suggestion });
  } catch (error) {
    console.error("Error rejecting suggestion:", error);
    const message = error instanceof Error ? error.message : "Failed to reject suggestion";
    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}
