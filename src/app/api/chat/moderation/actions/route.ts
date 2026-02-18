import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET /api/chat/moderation/actions - List mod actions (audit log)
export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const channelId = searchParams.get("channelId");

  if (!channelId) {
    return NextResponse.json({ error: "channelId is required" }, { status: 400 });
  }

  const member = await prisma.chatChannelMember.findUnique({
    where: { userId_channelId: { userId: session.user.id, channelId } },
  });
  if (!member || !["OWNER", "ADMIN"].includes(member.role)) {
    return NextResponse.json({ error: "Insufficient permissions" }, { status: 403 });
  }

  const actions = await prisma.chatModAction.findMany({
    where: { channelId },
    include: {
      target: { select: { id: true, name: true, firstName: true, lastName: true, image: true } },
      moderator: { select: { id: true, name: true, firstName: true, lastName: true, image: true } },
    },
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  return NextResponse.json({ actions });
}

// POST /api/chat/moderation/actions - Perform mod action
export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { channelId, targetUserId, action, reason, duration, messageId } = await req.json();

  if (!channelId || !targetUserId || !action) {
    return NextResponse.json({ error: "channelId, targetUserId, and action are required" }, { status: 400 });
  }

  const member = await prisma.chatChannelMember.findUnique({
    where: { userId_channelId: { userId: session.user.id, channelId } },
  });
  if (!member || !["OWNER", "ADMIN", "MODERATOR"].includes(member.role)) {
    return NextResponse.json({ error: "Insufficient permissions" }, { status: 403 });
  }

  const modAction = await prisma.chatModAction.create({
    data: {
      channelId,
      targetUserId,
      moderatorId: session.user.id,
      action,
      reason: reason || null,
      duration: duration || null,
      messageId: messageId || null,
    },
  });

  // Execute the action
  if (action === "BAN_USER") {
    await prisma.chatChannelMember.delete({
      where: { userId_channelId: { userId: targetUserId, channelId } },
    }).catch(() => null);
  }

  if (action === "DELETE_MESSAGE" && messageId) {
    await prisma.chatMessage.update({
      where: { id: messageId },
      data: { isDeleted: true, deletedById: session.user.id, content: "[deleted]" },
    }).catch(() => null);
  }

  return NextResponse.json(modAction, { status: 201 });
}
