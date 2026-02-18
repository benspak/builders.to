import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// POST /api/chat/dm - Start or find a DM channel with a user
export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { userId: targetUserId } = await req.json();
  if (!targetUserId) {
    return NextResponse.json({ error: "userId is required" }, { status: 400 });
  }

  if (targetUserId === session.user.id) {
    return NextResponse.json({ error: "Cannot DM yourself" }, { status: 400 });
  }

  // Check if DM channel already exists between these two users
  const existingDm = await prisma.chatChannel.findFirst({
    where: {
      type: "DM",
      members: {
        every: {
          userId: { in: [session.user.id, targetUserId] },
        },
      },
      AND: [
        { members: { some: { userId: session.user.id } } },
        { members: { some: { userId: targetUserId } } },
      ],
    },
    include: {
      members: {
        include: {
          user: { select: { id: true, name: true, firstName: true, lastName: true, image: true, slug: true } },
        },
      },
    },
  });

  if (existingDm) {
    return NextResponse.json(existingDm);
  }

  // Create new DM channel
  const targetUser = await prisma.user.findUnique({
    where: { id: targetUserId },
    select: { name: true, firstName: true, lastName: true, slug: true },
  });

  if (!targetUser) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  const dmName = `dm-${[session.user.id, targetUserId].sort().join("-")}`;

  const channel = await prisma.chatChannel.create({
    data: {
      name: dmName,
      slug: `dm-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      type: "DM",
      createdById: session.user.id,
      members: {
        create: [
          { userId: session.user.id, role: "MEMBER", notificationPreference: "ALL" },
          { userId: targetUserId, role: "MEMBER", notificationPreference: "ALL" },
        ],
      },
    },
    include: {
      members: {
        include: {
          user: { select: { id: true, name: true, firstName: true, lastName: true, image: true, slug: true } },
        },
      },
    },
  });

  return NextResponse.json(channel, { status: 201 });
}
