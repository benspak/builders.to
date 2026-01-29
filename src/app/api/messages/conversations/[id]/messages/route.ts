import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { rateLimit, RATE_LIMITS, rateLimitResponse } from "@/lib/rate-limit";

interface RouteParams {
  params: Promise<{ id: string }>;
}

// GET /api/messages/conversations/[id]/messages - Get messages in a conversation
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: conversationId } = await params;
    const { searchParams } = new URL(request.url);
    const cursor = searchParams.get("cursor");
    const limit = Math.min(parseInt(searchParams.get("limit") || "50"), 100);

    // Check if user is a participant
    const participant = await prisma.conversationParticipant.findUnique({
      where: {
        userId_conversationId: {
          userId: session.user.id,
          conversationId,
        },
      },
    });

    if (!participant) {
      return NextResponse.json(
        { error: "Conversation not found" },
        { status: 404 }
      );
    }

    // Fetch messages with cursor-based pagination (newest first)
    const messages = await prisma.message.findMany({
      where: { conversationId },
      take: limit + 1, // Fetch one extra to determine if there are more
      cursor: cursor ? { id: cursor } : undefined,
      skip: cursor ? 1 : 0, // Skip cursor message
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        content: true,
        gifUrl: true,
        imageUrl: true,
        createdAt: true,
        editedAt: true,
        senderId: true,
        sender: {
          select: {
            id: true,
            name: true,
            firstName: true,
            lastName: true,
            image: true,
            slug: true,
          },
        },
      },
    });

    const hasMore = messages.length > limit;
    const messagesToReturn = hasMore ? messages.slice(0, -1) : messages;
    const nextCursor = hasMore
      ? messagesToReturn[messagesToReturn.length - 1]?.id
      : null;

    return NextResponse.json({
      messages: messagesToReturn,
      nextCursor,
      hasMore,
    });
  } catch (error) {
    console.error("Error fetching messages:", error);
    return NextResponse.json(
      { error: "Failed to fetch messages" },
      { status: 500 }
    );
  }
}

// POST /api/messages/conversations/[id]/messages - Send a message
export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    // Rate limit check
    const { success, reset } = rateLimit(request, RATE_LIMITS.comment);
    if (!success) {
      return rateLimitResponse(reset);
    }

    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: conversationId } = await params;
    const body = await request.json();
    const { content, gifUrl, imageUrl } = body;

    // Require content or media
    if (!content?.trim() && !gifUrl && !imageUrl) {
      return NextResponse.json(
        { error: "Message content or media is required" },
        { status: 400 }
      );
    }

    // Validate content length
    if (content && content.length > 5000) {
      return NextResponse.json(
        { error: "Message is too long (max 5000 characters)" },
        { status: 400 }
      );
    }

    // Check if user is a participant
    const participant = await prisma.conversationParticipant.findUnique({
      where: {
        userId_conversationId: {
          userId: session.user.id,
          conversationId,
        },
      },
    });

    if (!participant) {
      return NextResponse.json(
        { error: "Conversation not found" },
        { status: 404 }
      );
    }

    // Create the message and update conversation timestamp
    const [message] = await prisma.$transaction([
      prisma.message.create({
        data: {
          content: content?.trim() || "",
          gifUrl: gifUrl || null,
          imageUrl: imageUrl || null,
          senderId: session.user.id,
          conversationId,
        },
        select: {
          id: true,
          content: true,
          gifUrl: true,
          imageUrl: true,
          createdAt: true,
          editedAt: true,
          senderId: true,
          sender: {
            select: {
              id: true,
              name: true,
              firstName: true,
              lastName: true,
              image: true,
              slug: true,
            },
          },
        },
      }),
      // Update conversation timestamp
      prisma.conversation.update({
        where: { id: conversationId },
        data: { updatedAt: new Date() },
      }),
      // Mark as read for sender
      prisma.conversationParticipant.update({
        where: {
          userId_conversationId: {
            userId: session.user.id,
            conversationId,
          },
        },
        data: { lastReadAt: new Date() },
      }),
    ]);

    // TODO: Send push notification to other participants

    return NextResponse.json(message, { status: 201 });
  } catch (error) {
    console.error("Error sending message:", error);
    return NextResponse.json(
      { error: "Failed to send message" },
      { status: 500 }
    );
  }
}
