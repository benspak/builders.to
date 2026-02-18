import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET /api/chat/bookmarks - List user's bookmarked messages
export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const bookmarks = await prisma.chatMessageBookmark.findMany({
    where: { userId: session.user.id },
    include: {
      message: {
        include: {
          sender: { select: { id: true, name: true, firstName: true, lastName: true, image: true, slug: true } },
          channel: { select: { id: true, name: true, slug: true } },
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ bookmarks });
}
