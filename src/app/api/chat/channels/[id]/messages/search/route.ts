import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET /api/chat/channels/[id]/messages/search - Search within channel
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
  const q = searchParams.get("q");
  const author = searchParams.get("author");
  const limit = Math.min(parseInt(searchParams.get("limit") || "20"), 50);

  if (!q?.trim()) {
    return NextResponse.json({ error: "Search query is required" }, { status: 400 });
  }

  const messages = await prisma.chatMessage.findMany({
    where: {
      channelId: id,
      isDeleted: false,
      content: { contains: q, mode: "insensitive" },
      ...(author && { senderId: author }),
    },
    include: {
      sender: { select: { id: true, name: true, firstName: true, lastName: true, image: true, slug: true } },
    },
    orderBy: { createdAt: "desc" },
    take: limit,
  });

  return NextResponse.json({ messages, query: q });
}
