import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// PATCH /api/chat/messages/[id] - Edit message or toggle pin
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  const message = await prisma.chatMessage.findUnique({ where: { id } });
  if (!message) {
    return NextResponse.json({ error: "Message not found" }, { status: 404 });
  }

  const body = await req.json();

  // Handle pin toggle (requires mod permissions)
  if (typeof body.isPinned === "boolean") {
    const member = await prisma.chatChannelMember.findUnique({
      where: { userId_channelId: { userId: session.user.id, channelId: message.channelId } },
    });
    if (!member || !["OWNER", "ADMIN", "MODERATOR"].includes(member.role)) {
      return NextResponse.json({ error: "Only moderators can pin messages" }, { status: 403 });
    }

    const updated = await prisma.chatMessage.update({
      where: { id },
      data: {
        isPinned: body.isPinned,
        pinnedById: body.isPinned ? session.user.id : null,
      },
      include: {
        sender: { select: { id: true, name: true, firstName: true, lastName: true, image: true, slug: true } },
      },
    });

    return NextResponse.json(updated);
  }

  // Handle content edit (owner only)
  if (message.senderId !== session.user.id) {
    return NextResponse.json({ error: "Can only edit own messages" }, { status: 403 });
  }

  const { content } = body;
  if (!content?.trim()) {
    return NextResponse.json({ error: "Content is required" }, { status: 400 });
  }

  const updated = await prisma.chatMessage.update({
    where: { id },
    data: { content: content.trim(), editedAt: new Date() },
    include: {
      sender: { select: { id: true, name: true, firstName: true, lastName: true, image: true, slug: true } },
    },
  });

  return NextResponse.json(updated);
}

// DELETE /api/chat/messages/[id] - Delete message
export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  const message = await prisma.chatMessage.findUnique({ where: { id } });
  if (!message) {
    return NextResponse.json({ error: "Message not found" }, { status: 404 });
  }

  // Check permission
  if (message.senderId !== session.user.id) {
    const member = await prisma.chatChannelMember.findUnique({
      where: { userId_channelId: { userId: session.user.id, channelId: message.channelId } },
    });
    if (!member || !["OWNER", "ADMIN", "MODERATOR"].includes(member.role)) {
      return NextResponse.json({ error: "No permission" }, { status: 403 });
    }
  }

  await prisma.chatMessage.update({
    where: { id },
    data: { isDeleted: true, deletedById: session.user.id, content: "[deleted]" },
  });

  return NextResponse.json({ success: true });
}
