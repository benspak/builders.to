import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET /api/chat/messages/search - Global message search
export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q");
  const channelId = searchParams.get("channelId");
  const author = searchParams.get("author");
  const limit = Math.min(parseInt(searchParams.get("limit") || "20"), 50);

  if (!q?.trim()) {
    return NextResponse.json({ error: "Search query is required" }, { status: 400 });
  }

  // Get channels user is a member of
  const userChannels = await prisma.chatChannelMember.findMany({
    where: { userId: session.user.id },
    select: { channelId: true },
  });
  const channelIds = userChannels.map((c) => c.channelId);

  const messages = await prisma.chatMessage.findMany({
    where: {
      channelId: channelId ? { equals: channelId } : { in: channelIds },
      isDeleted: false,
      content: { contains: q, mode: "insensitive" },
      ...(author && { senderId: author }),
    },
    include: {
      sender: { select: { id: true, name: true, firstName: true, lastName: true, image: true, slug: true } },
      channel: { select: { id: true, name: true, slug: true } },
    },
    orderBy: { createdAt: "desc" },
    take: limit,
  });

  return NextResponse.json({ messages, query: q });
}
