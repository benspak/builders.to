import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { respondToPartnership, getPartnership } from "@/lib/services/accountability.service";
import { sendUserPushNotification } from "@/lib/push-notifications";

// POST /api/accountability/respond - Accept or decline a partnership request
export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { partnershipId, accept } = body;

    if (!partnershipId) {
      return NextResponse.json(
        { error: "Partnership ID is required" },
        { status: 400 }
      );
    }

    if (typeof accept !== "boolean") {
      return NextResponse.json(
        { error: "Accept must be a boolean" },
        { status: 400 }
      );
    }

    // Get the partnership first to get requester info
    const partnership = await getPartnership(partnershipId);
    if (!partnership) {
      return NextResponse.json(
        { error: "Partnership not found" },
        { status: 404 }
      );
    }

    const result = await respondToPartnership(
      partnershipId,
      session.user.id,
      accept
    );

    if (!result.success) {
      return NextResponse.json(
        { error: result.error },
        { status: 400 }
      );
    }

    // Notify the requester
    if (accept) {
      const responder = await prisma.user.findUnique({
        where: { id: session.user.id },
        select: { name: true, firstName: true, lastName: true, image: true },
      });

      const responderName = responder?.firstName && responder?.lastName
        ? `${responder.firstName} ${responder.lastName}`
        : responder?.name || "Someone";

      await prisma.notification.create({
        data: {
          type: "ACCOUNTABILITY_ACCEPTED",
          title: "Partnership accepted!",
          message: `${responderName} accepted your accountability partner request`,
          userId: partnership.requester.id,
          actorId: session.user.id,
          actorName: responderName,
          actorImage: responder?.image,
        },
      });

      // Send push notification
      sendUserPushNotification(partnership.requester.id, {
        title: "Partnership Accepted!",
        body: `${responderName} is now your accountability partner`,
        url: "/accountability",
        tag: "accountability-accepted",
      }).catch(console.error);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error responding to partnership:", error);
    return NextResponse.json(
      { error: "Failed to respond to partnership" },
      { status: 500 }
    );
  }
}
