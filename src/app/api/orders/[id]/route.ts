import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { captureServicePayment, cancelServicePayment, refundServicePayment } from "@/lib/stripe-connect";
import type { ServiceOrderStatus } from "@prisma/client";

interface RouteParams {
  params: Promise<{ id: string }>;
}

/**
 * GET /api/orders/[id]
 * Get order details
 */
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await auth();
    const { id } = await params;

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "You must be signed in" },
        { status: 401 }
      );
    }

    const order = await prisma.serviceOrder.findUnique({
      where: { id },
      include: {
        service: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                displayName: true,
                image: true,
                slug: true,
              },
            },
          },
        },
        buyer: {
          select: {
            id: true,
            name: true,
            displayName: true,
            image: true,
            slug: true,
            email: true,
          },
        },
      },
    });

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    // Only buyer or seller can view order
    const isBuyer = order.buyerId === session.user.id;
    const isSeller = order.service.userId === session.user.id;

    if (!isBuyer && !isSeller) {
      return NextResponse.json(
        { error: "You don't have access to this order" },
        { status: 403 }
      );
    }

    return NextResponse.json({ ...order, isBuyer, isSeller });
  } catch (error) {
    console.error("Error fetching order:", error);
    return NextResponse.json(
      { error: "Failed to fetch order" },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/orders/[id]
 * Update order status (accept, deliver, complete, cancel)
 */
export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await auth();
    const { id } = await params;

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "You must be signed in" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { action } = body as { action: string };

    const order = await prisma.serviceOrder.findUnique({
      where: { id },
      include: {
        service: {
          select: { userId: true, title: true },
        },
      },
    });

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    const isBuyer = order.buyerId === session.user.id;
    const isSeller = order.service.userId === session.user.id;

    if (!isBuyer && !isSeller) {
      return NextResponse.json(
        { error: "You don't have access to this order" },
        { status: 403 }
      );
    }

    let newStatus: ServiceOrderStatus | null = null;
    let updateData: Record<string, unknown> = {};

    switch (action) {
      case "accept":
        // Seller accepts the order
        if (!isSeller) {
          return NextResponse.json(
            { error: "Only the seller can accept orders" },
            { status: 403 }
          );
        }
        if (order.status !== "PENDING_ACCEPTANCE") {
          return NextResponse.json(
            { error: "Order cannot be accepted in current state" },
            { status: 400 }
          );
        }
        newStatus = "ACCEPTED";
        updateData = { acceptedAt: new Date() };
        break;

      case "start":
        // Seller starts working
        if (!isSeller) {
          return NextResponse.json(
            { error: "Only the seller can start work" },
            { status: 403 }
          );
        }
        if (order.status !== "ACCEPTED") {
          return NextResponse.json(
            { error: "Order must be accepted first" },
            { status: 400 }
          );
        }
        newStatus = "IN_PROGRESS";
        break;

      case "deliver":
        // Seller marks as delivered
        if (!isSeller) {
          return NextResponse.json(
            { error: "Only the seller can mark as delivered" },
            { status: 403 }
          );
        }
        if (!["ACCEPTED", "IN_PROGRESS"].includes(order.status)) {
          return NextResponse.json(
            { error: "Order is not in a deliverable state" },
            { status: 400 }
          );
        }
        newStatus = "DELIVERED";
        updateData = { deliveredAt: new Date() };
        break;

      case "complete":
        // Buyer confirms completion - release payment
        if (!isBuyer) {
          return NextResponse.json(
            { error: "Only the buyer can confirm completion" },
            { status: 403 }
          );
        }
        if (order.status !== "DELIVERED") {
          return NextResponse.json(
            { error: "Order must be delivered first" },
            { status: 400 }
          );
        }

        // Capture the payment (release from escrow)
        if (order.stripePaymentIntent) {
          const captured = await captureServicePayment(order.stripePaymentIntent);
          if (!captured) {
            return NextResponse.json(
              { error: "Failed to process payment release" },
              { status: 500 }
            );
          }
        }

        newStatus = "COMPLETED";
        updateData = { completedAt: new Date() };
        break;

      case "cancel":
        // Either party can cancel (with conditions)
        if (!["PENDING_ACCEPTANCE", "ACCEPTED"].includes(order.status)) {
          return NextResponse.json(
            { error: "Order cannot be cancelled at this stage" },
            { status: 400 }
          );
        }

        // Cancel the payment if it exists
        if (order.stripePaymentIntent) {
          const cancelled = await cancelServicePayment(order.stripePaymentIntent);
          if (!cancelled) {
            // Try refund if cancel fails (might be captured already)
            await refundServicePayment(order.stripePaymentIntent, "Order cancelled");
          }
        }

        newStatus = "CANCELLED";
        break;

      case "dispute":
        // Buyer can dispute a delivered order
        if (!isBuyer) {
          return NextResponse.json(
            { error: "Only the buyer can dispute" },
            { status: 403 }
          );
        }
        if (order.status !== "DELIVERED") {
          return NextResponse.json(
            { error: "Only delivered orders can be disputed" },
            { status: 400 }
          );
        }
        newStatus = "DISPUTED";
        break;

      default:
        return NextResponse.json(
          { error: "Invalid action" },
          { status: 400 }
        );
    }

    if (!newStatus) {
      return NextResponse.json(
        { error: "No status update needed" },
        { status: 400 }
      );
    }

    const updatedOrder = await prisma.serviceOrder.update({
      where: { id },
      data: {
        status: newStatus,
        ...updateData,
      },
    });

    return NextResponse.json(updatedOrder);
  } catch (error) {
    console.error("Error updating order:", error);
    return NextResponse.json(
      { error: "Failed to update order" },
      { status: 500 }
    );
  }
}
