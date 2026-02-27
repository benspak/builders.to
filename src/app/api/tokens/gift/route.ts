import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { debit as debitTokens, credit as creditTokens } from "@/lib/services/tokens.service";

/**
 * POST /api/tokens/gift - Gift tokens to another user
 * Body: { recipientUserId: string, amount: number }
 */
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const recipientUserId = body?.recipientUserId;
    const amount = typeof body?.amount === "number" ? Math.floor(body.amount) : undefined;

    if (!recipientUserId || typeof recipientUserId !== "string") {
      return NextResponse.json(
        { error: "recipientUserId is required" },
        { status: 400 }
      );
    }

    if (amount === undefined || amount < 1) {
      return NextResponse.json(
        { error: "amount must be a positive integer" },
        { status: 400 }
      );
    }

    if (recipientUserId === session.user.id) {
      return NextResponse.json(
        { error: "You cannot gift tokens to yourself" },
        { status: 400 }
      );
    }

    const recipient = await prisma.user.findUnique({
      where: { id: recipientUserId },
      select: { id: true, name: true },
    });

    if (!recipient) {
      return NextResponse.json(
        { error: "Recipient not found" },
        { status: 404 }
      );
    }

    try {
      await debitTokens({
        userId: session.user.id,
        amount,
        type: "GIFT_SENT",
        description: `Gift to ${recipient.name || "user"}`,
        metadata: { recipientUserId },
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : "Insufficient token balance";
      return NextResponse.json(
        { error: message, insufficientBalance: true },
        { status: 400 }
      );
    }

    await creditTokens({
      userId: recipientUserId,
      amount,
      type: "GIFT_RECEIVED",
      description: `Gift from ${session.user.name || "a builder"}`,
      metadata: { senderUserId: session.user.id },
    });

    await prisma.notification.create({
      data: {
        type: "TOKEN_GIFTED",
        title: "You received tokens!",
        message: `${session.user.name || "Someone"} gifted you ${amount} token${amount === 1 ? "" : "s"}.`,
        userId: recipientUserId,
        actorId: session.user.id,
      },
    });

    return NextResponse.json({
      success: true,
      amount,
      recipientUserId,
    });
  } catch (error) {
    console.error("[Tokens] Gift error:", error);
    return NextResponse.json(
      { error: "Failed to send gift" },
      { status: 500 }
    );
  }
}
