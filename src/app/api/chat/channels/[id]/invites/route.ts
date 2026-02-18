import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// POST /api/chat/channels/[id]/invites - Invite user to private channel
export async function POST(
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
  if (!member || !["OWNER", "ADMIN"].includes(member.role)) {
    return NextResponse.json({ error: "Insufficient permissions" }, { status: 403 });
  }

  const { inviteeId } = await req.json();
  if (!inviteeId) {
    return NextResponse.json({ error: "inviteeId is required" }, { status: 400 });
  }

  const existingMember = await prisma.chatChannelMember.findUnique({
    where: { userId_channelId: { userId: inviteeId, channelId: id } },
  });
  if (existingMember) {
    return NextResponse.json({ error: "User is already a member" }, { status: 409 });
  }

  const invite = await prisma.chatChannelInvite.upsert({
    where: { channelId_inviteeId: { channelId: id, inviteeId } },
    update: { status: "PENDING", inviterId: session.user.id },
    create: { channelId: id, inviterId: session.user.id, inviteeId, status: "PENDING" },
    include: {
      invitee: { select: { id: true, name: true, firstName: true, lastName: true, image: true } },
    },
  });

  return NextResponse.json(invite, { status: 201 });
}
