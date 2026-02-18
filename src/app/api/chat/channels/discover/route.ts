import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET /api/chat/channels/discover - Browse public channels to join
export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const search = searchParams.get("q") || "";
  const categoryId = searchParams.get("categoryId");

  const channels = await prisma.chatChannel.findMany({
    where: {
      type: "PUBLIC",
      isArchived: false,
      ...(search && {
        OR: [
          { name: { contains: search, mode: "insensitive" } },
          { description: { contains: search, mode: "insensitive" } },
        ],
      }),
      ...(categoryId && { categoryId }),
    },
    include: {
      category: true,
      _count: { select: { members: true } },
      members: {
        where: { userId: session.user.id },
        select: { id: true },
      },
    },
    orderBy: { members: { _count: "desc" } },
  });

  const result = channels.map((c) => ({
    id: c.id,
    name: c.name,
    slug: c.slug,
    description: c.description,
    topic: c.topic,
    category: c.category,
    memberCount: c._count.members,
    isJoined: c.members.length > 0,
  }));

  return NextResponse.json({ channels: result });
}
