import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// POST /api/chat/channels/[id]/read - Mark channel as read (REST fallback)
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id: channelId } = await params;
  const body = await req.json();
  const { messageId } = body;

  if (!messageId) {
    return NextResponse.json({ error: "messageId is required" }, { status: 400 });
  }

  try {
    await prisma.chatChannelMember.update({
      where: { userId_channelId: { userId: session.user.id, channelId } },
      data: { lastReadMessageId: messageId },
    });
  } catch {
    return NextResponse.json({ error: "Not a member" }, { status: 403 });
  }

  return NextResponse.json({ success: true });
}
