import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET /api/chat/channels/[id]/messages - Paginated message history
export async function GET(
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
  if (!member) {
    return NextResponse.json({ error: "Not a member" }, { status: 403 });
  }

  const { searchParams } = new URL(req.url);
  const cursor = searchParams.get("cursor");
  const limit = Math.min(parseInt(searchParams.get("limit") || "50"), 100);

  // Pro gating: free users get 90 days of history
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { proSubscription: { select: { status: true } } },
  });
  const isPro = user?.proSubscription?.status === "ACTIVE";
  const dateFilter = isPro ? {} : { createdAt: { gte: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000) } };

  const messages = await prisma.chatMessage.findMany({
    where: {
      channelId: id,
      threadParentId: null,
      ...dateFilter,
      ...(cursor && { createdAt: { lt: new Date(cursor) } }),
    },
    include: {
      sender: { select: { id: true, name: true, firstName: true, lastName: true, image: true, slug: true } },
      reactions: {
        include: { user: { select: { id: true, name: true, firstName: true, lastName: true } } },
      },
      _count: { select: { threadReplies: true } },
      poll: {
        include: {
          options: {
            include: { _count: { select: { votes: true } } },
            orderBy: { position: "asc" },
          },
        },
      },
    },
    orderBy: { createdAt: "desc" },
    take: limit + 1,
  });

  const hasMore = messages.length > limit;
  if (hasMore) messages.pop();

  return NextResponse.json({
    messages: messages.reverse(),
    hasMore,
    nextCursor: hasMore && messages.length > 0 ? messages[0].createdAt.toISOString() : null,
    isPro,
  });
}
