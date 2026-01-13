import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getStripe } from "@/lib/stripe";
import { GIFT_PACKAGES } from "@/lib/tokens";

/**
 * POST /api/tokens/gift
 * Create a Stripe checkout session to purchase tokens as a gift for another user
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
    const { recipientId, packageId } = body;

    if (!recipientId) {
      return NextResponse.json(
        { error: "Recipient is required" },
        { status: 400 }
      );
    }

    if (!packageId) {
      return NextResponse.json(
        { error: "Package is required" },
        { status: 400 }
      );
    }

    // Find the package
    const giftPackage = GIFT_PACKAGES.find(p => p.id === packageId);
    if (!giftPackage) {
      return NextResponse.json(
        { error: "Invalid gift package" },
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

    const recipientName = recipient.displayName
      || (recipient.firstName && recipient.lastName
        ? `${recipient.firstName} ${recipient.lastName}`
        : null)
      || recipient.name
      || "Builder";

    // Get sender info
    const sender = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        name: true,
        displayName: true,
        firstName: true,
        lastName: true,
      },
    });

    const senderName = sender?.displayName
      || (sender?.firstName && sender?.lastName
        ? `${sender.firstName} ${sender.lastName}`
        : null)
      || sender?.name
      || "A builder";

    // Create Stripe checkout session
    const stripe = getStripe();
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://builders.to";

    const checkoutSession = await stripe.checkout.sessions.create({
      mode: "payment",
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: `Gift: ${giftPackage.tokens} Tokens`,
              description: `Gift to ${recipientName} - ${giftPackage.description}`,
            },
            unit_amount: giftPackage.priceInCents,
          },
          quantity: 1,
        },
      ],
      metadata: {
        type: "token_gift",
        senderId: session.user.id,
        senderName,
        recipientId: recipient.id,
        recipientName,
        tokenAmount: giftPackage.tokens.toString(),
        packageId: giftPackage.id,
      },
      success_url: `${baseUrl}/${recipient.slug}?gift=success&tokens=${giftPackage.tokens}`,
      cancel_url: `${baseUrl}/${recipient.slug}?gift=cancelled`,
    });

    return NextResponse.json({
      checkoutUrl: checkoutSession.url,
      sessionId: checkoutSession.id,
    });
  } catch (error) {
    console.error("Error creating gift checkout:", error);
    return NextResponse.json(
      { error: "Failed to create gift checkout" },
      { status: 500 }
    );
  }
}
