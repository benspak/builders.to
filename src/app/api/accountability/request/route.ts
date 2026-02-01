import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { createPartnershipRequest } from "@/lib/services/accountability.service";
import { sendUserPushNotification } from "@/lib/push-notifications";
import { CheckInFrequency } from "@prisma/client";

// POST /api/accountability/request - Send a partnership request
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
    const { partnerId, goal, checkInFrequency, endDate } = body;

    if (!partnerId) {
      return NextResponse.json(
        { error: "Partner ID is required" },
        { status: 400 }
      );
    }

    // Validate checkInFrequency if provided
    if (checkInFrequency && !["DAILY", "WEEKDAYS", "WEEKLY"].includes(checkInFrequency)) {
      return NextResponse.json(
        { error: "Invalid check-in frequency" },
        { status: 400 }
      );
    }

    const result = await createPartnershipRequest({
      requesterId: session.user.id,
      partnerId,
      goal: goal || undefined,
      checkInFrequency: checkInFrequency as CheckInFrequency | undefined,
      endDate: endDate ? new Date(endDate) : undefined,
    });

    if (!result.success) {
      return NextResponse.json(
        { error: result.error },
        { status: 400 }
      );
    }

    // Create notification for the partner
    const requester = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { name: true, firstName: true, lastName: true, image: true, slug: true },
    });

    const requesterName = requester?.firstName && requester?.lastName
      ? `${requester.firstName} ${requester.lastName}`
      : requester?.name || "Someone";

    await prisma.notification.create({
      data: {
        type: "ACCOUNTABILITY_REQUEST",
        title: "New accountability partner request",
        message: `${requesterName} wants to be your accountability partner${goal ? `: "${goal}"` : ""}`,
        userId: partnerId,
        actorId: session.user.id,
        actorName: requesterName,
        actorImage: requester?.image,
      },
    });

    // Send push notification
    sendUserPushNotification(partnerId, {
      title: "Accountability Partner Request",
      body: `${requesterName} wants to be your accountability partner`,
      url: "/accountability",
      tag: "accountability-request",
    }).catch(console.error);

    return NextResponse.json({
      success: true,
      partnershipId: result.partnershipId,
    }, { status: 201 });
  } catch (error) {
    console.error("Error creating partnership request:", error);
    return NextResponse.json(
      { error: "Failed to create partnership request" },
      { status: 500 }
    );
  }
}
