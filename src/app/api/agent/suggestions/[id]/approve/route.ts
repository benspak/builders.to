import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { approveSuggestion, markSuggestionPublished } from "@/lib/services/agent.service";
import { createPost, publishPost } from "@/lib/services/posts.service";
import prisma from "@/lib/prisma";

// POST /api/agent/suggestions/[id]/approve - Approve a suggestion
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
    
    let editedContent: string | undefined;
    let publishImmediately = false;
    
    try {
      const body = await request.json();
      editedContent = body.editedContent;
      publishImmediately = body.publishImmediately === true;
    } catch {
      // No body or invalid JSON is fine
    }

    // Approve the suggestion
    const suggestion = await approveSuggestion(session.user.id, id, editedContent);

    // If publishing immediately, create and publish a post
    if (publishImmediately) {
      // Get user's connected platforms to determine which to use
      const connections = await prisma.platformConnection.findMany({
        where: { userId: session.user.id },
        select: { platform: true },
      });
      
      const platforms = suggestion.platforms.length > 0 
        ? suggestion.platforms 
        : connections.map(c => c.platform);

      if (platforms.length > 0) {
        const post = await createPost(session.user.id, {
          content: suggestion.content,
          platforms,
        });

        await publishPost(session.user.id, post.id);
        await markSuggestionPublished(id);

        return NextResponse.json({ 
          suggestion: { ...suggestion, status: "PUBLISHED" },
          published: true,
          postId: post.id,
        });
      }
    }

    return NextResponse.json({ suggestion, published: false });
  } catch (error) {
    console.error("Error approving suggestion:", error);
    const message = error instanceof Error ? error.message : "Failed to approve suggestion";
    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}
