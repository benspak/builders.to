import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET /api/chat/channels/[id]/pins - List pinned messages
export async function GET(
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
  if (!member) {
    return NextResponse.json({ error: "Not a member" }, { status: 403 });
  }

  const pins = await prisma.chatMessage.findMany({
    where: { channelId: id, isPinned: true, isDeleted: false },
    include: {
      sender: { select: { id: true, name: true, firstName: true, lastName: true, image: true, slug: true } },
      pinnedBy: { select: { id: true, name: true, firstName: true, lastName: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ pins });
}
