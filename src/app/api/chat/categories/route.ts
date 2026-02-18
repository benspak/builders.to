import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET /api/chat/categories - List channel categories
export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const categories = await prisma.chatChannelCategory.findMany({
    include: {
      _count: { select: { channels: true } },
    },
    orderBy: { position: "asc" },
  });

  return NextResponse.json({ categories });
}
