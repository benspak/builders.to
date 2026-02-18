import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET /api/chat/channels/[id] - Get channel details
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  const channel = await prisma.chatChannel.findUnique({
    where: { id },
    include: {
      category: true,
      createdBy: { select: { id: true, name: true, firstName: true, lastName: true, image: true, slug: true } },
      _count: { select: { members: true, messages: true } },
      members: {
        where: { userId: session.user.id },
        select: { role: true, notificationPreference: true, lastReadMessageId: true },
      },
    },
  });

  if (!channel) {
    return NextResponse.json({ error: "Channel not found" }, { status: 404 });
  }

  if (channel.type === "PRIVATE" && channel.members.length === 0) {
    return NextResponse.json({ error: "Not a member of this channel" }, { status: 403 });
  }

  return NextResponse.json({
    ...channel,
    membership: channel.members[0] || null,
  });
}

// PATCH /api/chat/channels/[id] - Update channel settings
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  const member = await prisma.chatChannelMember.findUnique({
    where: { userId_channelId: { userId: session.user.id, channelId: id } },
  });

  if (!member || !["OWNER", "ADMIN"].includes(member.role)) {
    return NextResponse.json({ error: "Insufficient permissions" }, { status: 403 });
  }

  const body = await req.json();
  const { name, description, topic, categoryId, slowModeSeconds, isArchived } = body;

  const updateData: Record<string, unknown> = {};
  if (name !== undefined) updateData.name = name.trim();
  if (description !== undefined) updateData.description = description?.trim() || null;
  if (topic !== undefined) updateData.topic = topic?.trim() || null;
  if (categoryId !== undefined) updateData.categoryId = categoryId || null;
  if (slowModeSeconds !== undefined) updateData.slowModeSeconds = slowModeSeconds;
  if (isArchived !== undefined) updateData.isArchived = isArchived;

  const channel = await prisma.chatChannel.update({
    where: { id },
    data: updateData,
    include: { category: true, _count: { select: { members: true } } },
  });

  return NextResponse.json(channel);
}

// DELETE /api/chat/channels/[id] - Archive channel
export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  const member = await prisma.chatChannelMember.findUnique({
    where: { userId_channelId: { userId: session.user.id, channelId: id } },
  });

  if (!member || member.role !== "OWNER") {
    return NextResponse.json({ error: "Only channel owner can delete" }, { status: 403 });
  }

  await prisma.chatChannel.update({
    where: { id },
    data: { isArchived: true },
  });

  return NextResponse.json({ success: true });
}
