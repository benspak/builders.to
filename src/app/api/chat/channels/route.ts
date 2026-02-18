import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

function isAdmin(email: string | null | undefined): boolean {
  if (!email) return false;
  const adminEmails = (process.env.ADMIN_EMAILS || "").split(",").map((e) => e.trim().toLowerCase()).filter(Boolean);
  return adminEmails.includes(email.toLowerCase());
}

// GET /api/chat/channels - List channels the user has joined
export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const memberships = await prisma.chatChannelMember.findMany({
    where: { userId: session.user.id },
    include: {
      channel: {
        include: {
          category: true,
          _count: { select: { members: true, messages: true } },
        },
      },
    },
    orderBy: { channel: { name: "asc" } },
  });

  // Get unread counts
  const channels = await Promise.all(
    memberships.map(async (m) => {
      let unreadCount = 0;
      if (m.lastReadMessageId) {
        const lastReadMsg = await prisma.chatMessage.findUnique({
          where: { id: m.lastReadMessageId },
          select: { createdAt: true },
        });
        if (lastReadMsg) {
          unreadCount = await prisma.chatMessage.count({
            where: {
              channelId: m.channelId,
              createdAt: { gt: lastReadMsg.createdAt },
              isDeleted: false,
            },
          });
        }
      } else {
        unreadCount = await prisma.chatMessage.count({
          where: { channelId: m.channelId, isDeleted: false },
        });
      }

      return {
        ...m.channel,
        membership: {
          role: m.role,
          notificationPreference: m.notificationPreference,
          lastReadMessageId: m.lastReadMessageId,
        },
        unreadCount,
      };
    })
  );

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { email: true },
  });

  return NextResponse.json({ channels, isAdmin: isAdmin(user?.email) });
}

// POST /api/chat/channels - Create a new channel (admin only)
export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const adminUser = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { email: true },
  });

  if (!isAdmin(adminUser?.email)) {
    return NextResponse.json({ error: "Only admins can create channels" }, { status: 403 });
  }

  const body = await req.json();
  const { name, description, topic, type, categoryId, slowModeSeconds } = body;

  if (!name?.trim()) {
    return NextResponse.json({ error: "Name is required" }, { status: 400 });
  }

  const slug = name
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .trim();

  const existing = await prisma.chatChannel.findUnique({ where: { slug } });
  if (existing) {
    return NextResponse.json({ error: "Channel with this name already exists" }, { status: 409 });
  }

  const channel = await prisma.chatChannel.create({
    data: {
      name: name.trim(),
      slug,
      description: description?.trim() || null,
      topic: topic?.trim() || null,
      type: type === "PRIVATE" ? "PRIVATE" : "PUBLIC",
      categoryId: categoryId || null,
      slowModeSeconds: slowModeSeconds || 0,
      createdById: session.user.id,
      members: {
        create: {
          userId: session.user.id,
          role: "OWNER",
          notificationPreference: "ALL",
        },
      },
    },
    include: {
      category: true,
      _count: { select: { members: true } },
    },
  });

  return NextResponse.json(channel, { status: 201 });
}
