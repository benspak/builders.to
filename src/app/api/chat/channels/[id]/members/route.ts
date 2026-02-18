import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET /api/chat/channels/[id]/members - List members
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  const isMember = await prisma.chatChannelMember.findUnique({
    where: { userId_channelId: { userId: session.user.id, channelId: id } },
  });

  if (!isMember) {
    return NextResponse.json({ error: "Not a member" }, { status: 403 });
  }

  const members = await prisma.chatChannelMember.findMany({
    where: { channelId: id },
    include: {
      user: {
        select: {
          id: true, name: true, firstName: true, lastName: true,
          image: true, slug: true, headline: true,
          chatPresence: { select: { status: true, lastSeenAt: true, customStatus: true } },
        },
      },
    },
    orderBy: [{ role: "asc" }, { joinedAt: "asc" }],
  });

  return NextResponse.json({ members });
}

// POST /api/chat/channels/[id]/members - Join a public channel
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  const channel = await prisma.chatChannel.findUnique({ where: { id } });
  if (!channel) {
    return NextResponse.json({ error: "Channel not found" }, { status: 404 });
  }

  if (channel.type === "PRIVATE") {
    return NextResponse.json({ error: "Cannot join private channel directly" }, { status: 403 });
  }

  const existing = await prisma.chatChannelMember.findUnique({
    where: { userId_channelId: { userId: session.user.id, channelId: id } },
  });
  if (existing) {
    return NextResponse.json({ error: "Already a member" }, { status: 409 });
  }

  const member = await prisma.chatChannelMember.create({
    data: { userId: session.user.id, channelId: id },
    include: {
      user: { select: { id: true, name: true, firstName: true, lastName: true, image: true, slug: true } },
    },
  });

  return NextResponse.json(member, { status: 201 });
}

// DELETE /api/chat/channels/[id]/members - Leave channel or remove member
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const { searchParams } = new URL(req.url);
  const targetUserId = searchParams.get("userId") || session.user.id;

  // If removing another user, check permissions
  if (targetUserId !== session.user.id) {
    const myMembership = await prisma.chatChannelMember.findUnique({
      where: { userId_channelId: { userId: session.user.id, channelId: id } },
    });
    if (!myMembership || !["OWNER", "ADMIN", "MODERATOR"].includes(myMembership.role)) {
      return NextResponse.json({ error: "Insufficient permissions" }, { status: 403 });
    }
  }

  await prisma.chatChannelMember.delete({
    where: { userId_channelId: { userId: targetUserId, channelId: id } },
  }).catch(() => null);

  return NextResponse.json({ success: true });
}
