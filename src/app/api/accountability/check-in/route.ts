import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { createCheckIn, getPartnership } from "@/lib/services/accountability.service";
import { sendUserPushNotification } from "@/lib/push-notifications";
import { CheckInMood } from "@prisma/client";

// POST /api/accountability/check-in - Record a check-in
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
    const { partnershipId, note, mood } = body;

    if (!partnershipId) {
      return NextResponse.json(
        { error: "Partnership ID is required" },
        { status: 400 }
      );
    }

    // Validate mood if provided
    if (mood && !["CRUSHING_IT", "GOOD", "OKAY", "STRUGGLING"].includes(mood)) {
      return NextResponse.json(
        { error: "Invalid mood value" },
        { status: 400 }
      );
    }

    const result = await createCheckIn({
      partnershipId,
      userId: session.user.id,
      note: note || undefined,
      mood: mood as CheckInMood | undefined,
    });

    if (!result.success) {
      return NextResponse.json(
        { error: result.error },
        { status: 400 }
      );
    }

    // Get partnership to notify partner
    const partnership = await getPartnership(partnershipId);
    if (partnership) {
      // Determine the partner to notify
      const partnerId = partnership.requester.id === session.user.id
        ? partnership.partner.id
        : partnership.requester.id;
      const partnerUser = partnership.requester.id === session.user.id
        ? partnership.partner
        : partnership.requester;

      // Get current user info
      const currentUser = await prisma.user.findUnique({
        where: { id: session.user.id },
        select: { name: true, firstName: true, lastName: true, image: true },
      });

      const userName = currentUser?.firstName && currentUser?.lastName
        ? `${currentUser.firstName} ${currentUser.lastName}`
        : currentUser?.name || "Your partner";

      // Create notification
      await prisma.notification.create({
        data: {
          type: "ACCOUNTABILITY_CHECK_IN",
          title: `${userName} checked in`,
          message: note
            ? note.length > 100
              ? note.substring(0, 100) + "..."
              : note
            : "Your accountability partner just checked in!",
          userId: partnerId,
          actorId: session.user.id,
          actorName: userName,
          actorImage: currentUser?.image,
        },
      });

      // Send push notification
      sendUserPushNotification(partnerId, {
        title: "Partner Check-in",
        body: `${userName} just checked in!`,
        url: "/accountability",
        tag: "accountability-checkin",
      }).catch(console.error);
    }

    return NextResponse.json({
      success: true,
      checkInId: result.checkInId,
    }, { status: 201 });
  } catch (error) {
    console.error("Error creating check-in:", error);
    return NextResponse.json(
      { error: "Failed to create check-in" },
      { status: 500 }
    );
  }
}
