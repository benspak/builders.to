import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { debit as debitTokens, centsToTokens } from "@/lib/services/tokens.service";

/**
 * POST /api/orders - Create a service order (pay with tokens)
 * Body: { serviceId: string, requirements?: string }
 */
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "You must be signed in to order a service" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const serviceId = body?.serviceId;
    const requirements = typeof body?.requirements === "string" ? body.requirements : undefined;

    if (!serviceId) {
      return NextResponse.json(
        { error: "serviceId is required" },
        { status: 400 }
      );
    }

    const now = new Date();
    const service = await prisma.serviceListing.findFirst({
      where: {
        id: serviceId,
        status: "ACTIVE",
        OR: [{ expiresAt: null }, { expiresAt: { gt: now } }],
      },
      select: { id: true, userId: true, title: true, priceInCents: true },
    });

    if (!service) {
      return NextResponse.json(
        { error: "Service not found or no longer available" },
        { status: 404 }
      );
    }

    if (service.userId === session.user.id) {
      return NextResponse.json(
        { error: "You cannot order your own service" },
        { status: 400 }
      );
    }

    const costTokens = centsToTokens(service.priceInCents);

    try {
      await debitTokens({
        userId: session.user.id,
        amount: costTokens,
        type: "SERVICE_REDEMPTION",
        description: `Service: ${service.title}`,
        metadata: { serviceId },
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : "Insufficient token balance";
      return NextResponse.json(
        { error: message, insufficientBalance: true },
        { status: 400 }
      );
    }

    const order = await prisma.serviceOrder.create({
      data: {
        serviceId: service.id,
        buyerId: session.user.id,
        priceInCents: service.priceInCents,
        platformFeeInCents: 0,
        requirements: requirements ?? null,
        stripePaymentIntent: null, // Token-paid
      },
      include: {
        service: {
          select: { title: true, user: { select: { slug: true } } },
        },
      },
    });

    return NextResponse.json({
      success: true,
      orderId: order.id,
      order,
    });
  } catch (error) {
    console.error("[Orders] Create error:", error);
    return NextResponse.json(
      { error: "Failed to create order" },
      { status: 500 }
    );
  }
}
