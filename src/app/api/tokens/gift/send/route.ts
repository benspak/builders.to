import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { notifyTokenGift } from "@/lib/push-notifications";

/**
 * POST /api/tokens/gift/send
 * Gift tokens from your own balance to another user (no payment required)
 */
export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "You must be signed in" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { recipientId, amount } = body;

    if (!recipientId) {
      return NextResponse.json(
        { error: "Recipient is required" },
        { status: 400 }
      );
    }

    const tokenAmount = parseInt(amount, 10);
    if (!tokenAmount || tokenAmount <= 0) {
      return NextResponse.json(
        { error: "Amount must be a positive number" },
        { status: 400 }
      );
    }

    // Can't gift to yourself
    if (recipientId === session.user.id) {
      return NextResponse.json(
        { error: "You cannot gift tokens to yourself" },
        { status: 400 }
      );
    }

    // Verify recipient exists
    const recipient = await prisma.user.findUnique({
      where: { id: recipientId },
      select: {
        id: true,
        name: true,
        displayName: true,
        firstName: true,
        lastName: true,
        slug: true,
      },
    });

    if (!recipient) {
      return NextResponse.json(
        { error: "Recipient not found" },
        { status: 404 }
      );
    }

    // Get sender info and check balance
    const sender = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        tokenBalance: true,
        name: true,
        displayName: true,
        firstName: true,
        lastName: true,
        image: true,
      },
    });

    if (!sender) {
      return NextResponse.json(
        { error: "Sender not found" },
        { status: 404 }
      );
    }

    if (sender.tokenBalance < tokenAmount) {
      return NextResponse.json(
        {
          error: "Insufficient tokens",
          balance: sender.tokenBalance,
          required: tokenAmount,
        },
        { status: 400 }
      );
    }

    const senderName = sender.displayName
      || (sender.firstName && sender.lastName
        ? `${sender.firstName} ${sender.lastName}`
        : null)
      || sender.name
      || "A builder";

    const recipientName = recipient.displayName
      || (recipient.firstName && recipient.lastName
        ? `${recipient.firstName} ${recipient.lastName}`
        : null)
      || recipient.name
      || "Builder";

    // Use a transaction to ensure atomicity
    const result = await prisma.$transaction(async (tx) => {
      // Deduct from sender's balance
      await tx.user.update({
        where: { id: session.user.id },
        data: {
          tokenBalance: { decrement: tokenAmount },
        },
      });

      // Create transaction record for sender (tokens they gifted)
      const senderTransaction = await tx.tokenTransaction.create({
        data: {
          userId: session.user.id,
          amount: -tokenAmount,
          type: "GIFT_SENT",
          description: `Gifted ${tokenAmount} tokens to ${recipientName}`,
          metadata: {
            recipientId: recipient.id,
            recipientName,
          },
        },
      });

      // Add to recipient's balance and lifetime tokens
      await tx.user.update({
        where: { id: recipient.id },
        data: {
          tokenBalance: { increment: tokenAmount },
          lifetimeTokensEarned: { increment: tokenAmount },
        },
      });

      // Create transaction record for recipient
      const recipientTransaction = await tx.tokenTransaction.create({
        data: {
          userId: recipient.id,
          amount: tokenAmount,
          type: "GIFT_RECEIVED",
          description: `Received ${tokenAmount} tokens from ${senderName}`,
          metadata: {
            senderId: session.user.id,
            senderName,
          },
        },
      });

      // Create notification for the recipient
      await tx.notification.create({
        data: {
          type: "TOKEN_GIFTED",
          title: `${senderName} gifted you ${tokenAmount} tokens! 🎁`,
          message: `You received ${tokenAmount} tokens as a gift. Check your token balance!`,
          userId: recipient.id,
          actorId: session.user.id,
          actorName: senderName,
          actorImage: sender.image || null,
        },
      });

      // Get sender's new balance
      const updatedSender = await tx.user.findUnique({
        where: { id: session.user.id },
        select: { tokenBalance: true },
      });

      return {
        senderTransactionId: senderTransaction.id,
        recipientTransactionId: recipientTransaction.id,
        newBalance: updatedSender?.tokenBalance ?? 0,
      };
    });

    // Send push notification to recipient
    notifyTokenGift(recipient.id, senderName, tokenAmount).catch(console.error);

    return NextResponse.json({
      success: true,
      message: `Successfully gifted ${tokenAmount} tokens to ${recipientName}`,
      tokensGifted: tokenAmount,
      newBalance: result.newBalance,
      recipientSlug: recipient.slug,
    });
  } catch (error) {
    console.error("Error gifting tokens:", error);

    if (error instanceof Error && error.message === "Insufficient token balance") {
      return NextResponse.json(
        { error: "Insufficient tokens" },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Failed to gift tokens" },
      { status: 500 }
    );
  }
}
