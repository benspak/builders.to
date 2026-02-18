import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// POST /api/chat/messages/[id]/bookmark - Toggle bookmark
export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  const existing = await prisma.chatMessageBookmark.findUnique({
    where: { messageId_userId: { messageId: id, userId: session.user.id } },
  });

  if (existing) {
    await prisma.chatMessageBookmark.delete({ where: { id: existing.id } });
    return NextResponse.json({ bookmarked: false });
  }

  await prisma.chatMessageBookmark.create({
    data: { messageId: id, userId: session.user.id },
  });

  return NextResponse.json({ bookmarked: true });
}
