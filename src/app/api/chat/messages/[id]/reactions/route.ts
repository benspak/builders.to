import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// POST /api/chat/messages/[id]/reactions - Toggle reaction
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const { emoji } = await req.json();

  if (!emoji) {
    return NextResponse.json({ error: "emoji is required" }, { status: 400 });
  }

  const message = await prisma.chatMessage.findUnique({ where: { id } });
  if (!message) {
    return NextResponse.json({ error: "Message not found" }, { status: 404 });
  }

  const existing = await prisma.chatMessageReaction.findUnique({
    where: { messageId_userId_emoji: { messageId: id, userId: session.user.id, emoji } },
  });

  if (existing) {
    await prisma.chatMessageReaction.delete({ where: { id: existing.id } });
  } else {
    await prisma.chatMessageReaction.create({
      data: { messageId: id, userId: session.user.id, emoji },
    });
  }

  const reactions = await prisma.chatMessageReaction.findMany({
    where: { messageId: id },
    include: { user: { select: { id: true, name: true, firstName: true, lastName: true } } },
  });

  return NextResponse.json({ reactions });
}
