import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { rateLimit, RATE_LIMITS, rateLimitResponse } from "@/lib/rate-limit";

// GET /api/messages/conversations - List user's conversations
export async function GET(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const skip = (page - 1) * limit;
    const includeArchived = searchParams.get("archived") === "true";

    // Build where clause for participant
    const participantWhere: Record<string, unknown> = {
      userId: session.user.id,
    };

    if (!includeArchived) {
      participantWhere.isArchived = false;
    }

    // Get conversations where user is a participant
    const [conversations, total] = await Promise.all([
      prisma.conversation.findMany({
        where: {
          participants: {
            some: participantWhere,
          },
        },
        orderBy: { updatedAt: "desc" },
        skip,
        take: limit,
        select: {
          id: true,
          createdAt: true,
          updatedAt: true,
          participants: {
            select: {
              userId: true,
              lastReadAt: true,
              mutedUntil: true,
              isArchived: true,
              user: {
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
          },
          messages: {
            take: 1,
            orderBy: { createdAt: "desc" },
            select: {
              id: true,
              content: true,
              gifUrl: true,
              imageUrl: true,
              createdAt: true,
              senderId: true,
            },
          },
        },
      }),
      prisma.conversation.count({
        where: {
          participants: {
            some: participantWhere,
          },
        },
      }),
    ]);

    // Transform conversations to include other participant and unread status
    const conversationsWithMeta = conversations.map((conv) => {
      const currentUserParticipant = conv.participants.find(
        (p) => p.userId === session.user!.id
      );
      const otherParticipants = conv.participants.filter(
        (p) => p.userId !== session.user!.id
      );
      const lastMessage = conv.messages[0] || null;

      // Check if there are unread messages
      const hasUnread =
        lastMessage &&
        (!currentUserParticipant?.lastReadAt ||
          new Date(lastMessage.createdAt) >
            new Date(currentUserParticipant.lastReadAt));

      return {
        id: conv.id,
        createdAt: conv.createdAt,
        updatedAt: conv.updatedAt,
        otherParticipants: otherParticipants.map((p) => p.user),
        lastMessage,
        hasUnread,
        isArchived: currentUserParticipant?.isArchived || false,
        isMuted: currentUserParticipant?.mutedUntil
          ? new Date(currentUserParticipant.mutedUntil) > new Date()
          : false,
      };
    });

    return NextResponse.json({
      conversations: conversationsWithMeta,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching conversations:", error);
    return NextResponse.json(
      { error: "Failed to fetch conversations" },
      { status: 500 }
    );
  }
}

// POST /api/messages/conversations - Create or get existing conversation
export async function POST(request: NextRequest) {
  try {
    // Rate limit check
    const { success, reset } = rateLimit(request, RATE_LIMITS.action);
    if (!success) {
      return rateLimitResponse(reset);
    }

    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { recipientId } = body;

    if (!recipientId) {
      return NextResponse.json(
        { error: "Recipient ID is required" },
        { status: 400 }
      );
    }

    // Can't start conversation with yourself
    if (recipientId === session.user.id) {
      return NextResponse.json(
        { error: "Cannot start a conversation with yourself" },
        { status: 400 }
      );
    }

    // Check if recipient exists
    const recipient = await prisma.user.findUnique({
      where: { id: recipientId },
      select: {
        id: true,
        name: true,
        firstName: true,
        lastName: true,
        image: true,
        slug: true,
      },
    });

    if (!recipient) {
      return NextResponse.json(
        { error: "Recipient not found" },
        { status: 404 }
      );
    }

    // Check if conversation already exists between these users
    const existingConversation = await prisma.conversation.findFirst({
      where: {
        AND: [
          {
            participants: {
              some: { userId: session.user.id },
            },
          },
          {
            participants: {
              some: { userId: recipientId },
            },
          },
        ],
        // Only for 1:1 conversations
        participants: {
          every: {
            userId: { in: [session.user.id, recipientId] },
          },
        },
      },
      select: {
        id: true,
        createdAt: true,
        updatedAt: true,
        participants: {
          select: {
            userId: true,
            lastReadAt: true,
            user: {
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
        },
      },
    });

    if (existingConversation) {
      // Unarchive if it was archived
      await prisma.conversationParticipant.updateMany({
        where: {
          conversationId: existingConversation.id,
          userId: session.user.id,
          isArchived: true,
        },
        data: { isArchived: false },
      });

      return NextResponse.json({
        conversation: existingConversation,
        isNew: false,
      });
    }

    // Create new conversation
    const conversation = await prisma.conversation.create({
      data: {
        participants: {
          create: [
            { userId: session.user.id },
            { userId: recipientId },
          ],
        },
      },
      select: {
        id: true,
        createdAt: true,
        updatedAt: true,
        participants: {
          select: {
            userId: true,
            lastReadAt: true,
            user: {
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
        },
      },
    });

    return NextResponse.json(
      {
        conversation,
        isNew: true,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating conversation:", error);
    return NextResponse.json(
      { error: "Failed to create conversation" },
      { status: 500 }
    );
  }
}
