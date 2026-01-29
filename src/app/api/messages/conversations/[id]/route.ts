import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

interface RouteParams {
  params: Promise<{ id: string }>;
}

// GET /api/messages/conversations/[id] - Get conversation details
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    // Check if user is a participant
    const participant = await prisma.conversationParticipant.findUnique({
      where: {
        userId_conversationId: {
          userId: session.user.id,
          conversationId: id,
        },
      },
    });

    if (!participant) {
      return NextResponse.json(
        { error: "Conversation not found" },
        { status: 404 }
      );
    }

    const conversation = await prisma.conversation.findUnique({
      where: { id },
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
                headline: true,
              },
            },
          },
        },
      },
    });

    if (!conversation) {
      return NextResponse.json(
        { error: "Conversation not found" },
        { status: 404 }
      );
    }

    const currentUserParticipant = conversation.participants.find(
      (p) => p.userId === session.user!.id
    );
    const otherParticipants = conversation.participants.filter(
      (p) => p.userId !== session.user!.id
    );

    return NextResponse.json({
      id: conversation.id,
      createdAt: conversation.createdAt,
      updatedAt: conversation.updatedAt,
      otherParticipants: otherParticipants.map((p) => ({
        ...p.user,
        lastReadAt: p.lastReadAt,
      })),
      isArchived: currentUserParticipant?.isArchived || false,
      isMuted: currentUserParticipant?.mutedUntil
        ? new Date(currentUserParticipant.mutedUntil) > new Date()
        : false,
      mutedUntil: currentUserParticipant?.mutedUntil,
    });
  } catch (error) {
    console.error("Error fetching conversation:", error);
    return NextResponse.json(
      { error: "Failed to fetch conversation" },
      { status: 500 }
    );
  }
}

// PATCH /api/messages/conversations/[id] - Update conversation settings
export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const { isArchived, mutedUntil } = body;

    // Check if user is a participant
    const participant = await prisma.conversationParticipant.findUnique({
      where: {
        userId_conversationId: {
          userId: session.user.id,
          conversationId: id,
        },
      },
    });

    if (!participant) {
      return NextResponse.json(
        { error: "Conversation not found" },
        { status: 404 }
      );
    }

    const updateData: Record<string, unknown> = {};
    if (isArchived !== undefined) updateData.isArchived = isArchived;
    if (mutedUntil !== undefined) {
      updateData.mutedUntil = mutedUntil ? new Date(mutedUntil) : null;
    }

    await prisma.conversationParticipant.update({
      where: {
        userId_conversationId: {
          userId: session.user.id,
          conversationId: id,
        },
      },
      data: updateData,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error updating conversation:", error);
    return NextResponse.json(
      { error: "Failed to update conversation" },
      { status: 500 }
    );
  }
}
