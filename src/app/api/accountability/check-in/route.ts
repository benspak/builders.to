import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { createCheckIn, getPartnership } from "@/lib/services/accountability.service";
import { sendUserPushNotification } from "@/lib/push-notifications";
import { CheckInMood } from "@prisma/client";
import { awardKarmaForUpdate } from "@/lib/services/karma.service";

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
    const { partnershipId, note, mood, imageUrl } = body;

    if (!partnershipId) {
      return NextResponse.json(
        { error: "Partnership ID is required" },
        { status: 400 }
      );
    }

    // Require a message for accountability check-ins
    if (!note || note.trim().length === 0) {
      return NextResponse.json(
        { error: "A message is required for accountability check-ins" },
        { status: 400 }
      );
    }

    if (note.length > 10000) {
      return NextResponse.json(
        { error: "Message must be 10,000 characters or less" },
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

    // Get partnership to get partner name for the update
    const partnership = await getPartnership(partnershipId);
    if (!partnership) {
      return NextResponse.json(
        { error: "Partnership not found" },
        { status: 404 }
      );
    }

    // Determine the partner
    const partnerUser = partnership.requester.id === session.user.id
      ? partnership.partner
      : partnership.requester;
    const partnerDisplayName = partnerUser.displayName
      || (partnerUser.firstName && partnerUser.lastName
        ? `${partnerUser.firstName} ${partnerUser.lastName}`
        : null)
      || partnerUser.name
      || "my partner";

    // Create a DailyUpdate so the check-in appears in the social feed
    // with full likes, comments, and image support
    const moodLabel = mood === "CRUSHING_IT" ? "Crushing it"
      : mood === "GOOD" ? "Good"
      : mood === "OKAY" ? "Okay"
      : mood === "STRUGGLING" ? "Struggling"
      : null;

    const updateContent = note.trim();

    // Calculate and update streak (same logic as updates API)
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { currentStreak: true, longestStreak: true, lastActivityDate: true },
    });

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    let newStreak = 1;
    let longestStreak = user?.longestStreak || 0;

    if (user?.lastActivityDate) {
      const lastActivity = new Date(user.lastActivityDate);
      lastActivity.setHours(0, 0, 0, 0);
      const daysDiff = Math.floor((today.getTime() - lastActivity.getTime()) / (1000 * 60 * 60 * 24));

      if (daysDiff === 0) {
        newStreak = user.currentStreak || 1;
      } else if (daysDiff === 1) {
        newStreak = (user.currentStreak || 0) + 1;
      }
    }

    if (newStreak > longestStreak) {
      longestStreak = newStreak;
    }

    // Create the DailyUpdate and update streak in a transaction
    const [dailyUpdate] = await prisma.$transaction([
      prisma.dailyUpdate.create({
        data: {
          content: updateContent,
          imageUrl: imageUrl || null,
          userId: session.user.id,
        },
      }),
      prisma.user.update({
        where: { id: session.user.id },
        data: {
          currentStreak: newStreak,
          longestStreak: longestStreak,
          lastActivityDate: today,
        },
      }),
    ]);

    // Award karma for posting an update
    awardKarmaForUpdate(session.user.id, dailyUpdate.id).catch(console.error);

    // Create the accountability check-in linked to the DailyUpdate
    const result = await createCheckIn({
      partnershipId,
      userId: session.user.id,
      note: note.trim(),
      mood: mood as CheckInMood | undefined,
      imageUrl: imageUrl || undefined,
      dailyUpdateId: dailyUpdate.id,
    });

    if (!result.success) {
      // Clean up the daily update if check-in creation fails
      await prisma.dailyUpdate.delete({ where: { id: dailyUpdate.id } }).catch(console.error);
      return NextResponse.json(
        { error: result.error },
        { status: 400 }
      );
    }

    // Determine the partner to notify
    const partnerId = partnership.requester.id === session.user.id
      ? partnership.partner.id
      : partnership.requester.id;

    // Get current user info for notification
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
        message: note.length > 100
          ? note.substring(0, 100) + "..."
          : note,
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

    return NextResponse.json({
      success: true,
      checkInId: result.checkInId,
      updateId: dailyUpdate.id,
    }, { status: 201 });
  } catch (error) {
    console.error("Error creating check-in:", error);
    return NextResponse.json(
      { error: "Failed to create check-in" },
      { status: 500 }
    );
  }
}
