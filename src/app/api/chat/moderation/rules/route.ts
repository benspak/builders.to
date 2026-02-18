import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET /api/chat/moderation/rules - List auto-mod rules
export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const channelId = searchParams.get("channelId");

  // Check permission
  if (channelId) {
    const member = await prisma.chatChannelMember.findUnique({
      where: { userId_channelId: { userId: session.user.id, channelId } },
    });
    if (!member || !["OWNER", "ADMIN"].includes(member.role)) {
      return NextResponse.json({ error: "Insufficient permissions" }, { status: 403 });
    }
  }

  const rules = await prisma.chatAutoModRule.findMany({
    where: channelId ? { channelId } : { channelId: null },
    orderBy: { createdAt: "asc" },
  });

  return NextResponse.json({ rules });
}

// POST /api/chat/moderation/rules - Create auto-mod rule
export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const { channelId, type, config, isEnabled } = body;

  if (!type || !config) {
    return NextResponse.json({ error: "type and config are required" }, { status: 400 });
  }

  // Permission check
  if (channelId) {
    const member = await prisma.chatChannelMember.findUnique({
      where: { userId_channelId: { userId: session.user.id, channelId } },
    });
    if (!member || !["OWNER", "ADMIN"].includes(member.role)) {
      return NextResponse.json({ error: "Insufficient permissions" }, { status: 403 });
    }
  } else {
    // Global rules: admin only
    const user = await prisma.user.findUnique({ where: { id: session.user.id }, select: { email: true } });
    const adminEmails = process.env.ADMIN_EMAILS?.split(",") || [];
    if (!user?.email || !adminEmails.includes(user.email)) {
      return NextResponse.json({ error: "Admin only" }, { status: 403 });
    }
  }

  const rule = await prisma.chatAutoModRule.create({
    data: {
      channelId: channelId || null,
      type,
      config,
      isEnabled: isEnabled ?? true,
    },
  });

  return NextResponse.json(rule, { status: 201 });
}

// PATCH /api/chat/moderation/rules - Update auto-mod rule
export async function PATCH(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id, config, isEnabled } = await req.json();
  if (!id) {
    return NextResponse.json({ error: "Rule id is required" }, { status: 400 });
  }

  const rule = await prisma.chatAutoModRule.findUnique({ where: { id } });
  if (!rule) {
    return NextResponse.json({ error: "Rule not found" }, { status: 404 });
  }

  const updateData: Record<string, unknown> = {};
  if (config !== undefined) updateData.config = config;
  if (isEnabled !== undefined) updateData.isEnabled = isEnabled;

  const updated = await prisma.chatAutoModRule.update({
    where: { id },
    data: updateData,
  });

  return NextResponse.json(updated);
}
