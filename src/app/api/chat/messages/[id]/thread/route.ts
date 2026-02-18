import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET /api/chat/messages/[id]/thread - Get thread replies
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  const parentMessage = await prisma.chatMessage.findUnique({
    where: { id },
    include: {
      sender: { select: { id: true, name: true, firstName: true, lastName: true, image: true, slug: true } },
      reactions: {
        include: { user: { select: { id: true, name: true, firstName: true, lastName: true } } },
      },
      channel: { select: { id: true, name: true } },
    },
  });

  if (!parentMessage) {
    return NextResponse.json({ error: "Message not found" }, { status: 404 });
  }

  const member = await prisma.chatChannelMember.findUnique({
    where: { userId_channelId: { userId: session.user.id, channelId: parentMessage.channelId } },
  });
  if (!member) {
    return NextResponse.json({ error: "Not a member" }, { status: 403 });
  }

  const { searchParams } = new URL(req.url);
  const cursor = searchParams.get("cursor");
  const limit = Math.min(parseInt(searchParams.get("limit") || "50"), 100);

  const replies = await prisma.chatMessage.findMany({
    where: {
      threadParentId: id,
      ...(cursor && { createdAt: { gt: new Date(cursor) } }),
    },
    include: {
      sender: { select: { id: true, name: true, firstName: true, lastName: true, image: true, slug: true } },
      reactions: {
        include: { user: { select: { id: true, name: true, firstName: true, lastName: true } } },
      },
    },
    orderBy: { createdAt: "asc" },
    take: limit,
  });

  return NextResponse.json({ parentMessage, replies });
}
