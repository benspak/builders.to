import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { createCheckIn } from "@/lib/services/accountability.service";
import { sendUserPushNotification } from "@/lib/push-notifications";
import { CheckInMood } from "@prisma/client";
import { awardKarmaForUpdate } from "@/lib/services/karma.service";

// POST /api/accountability/check-in - Record a single daily check-in for ALL active partnerships
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
    const { note, mood, imageUrl } = body;

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

    // Get ALL active partnerships for this user
    const activePartnerships = await prisma.accountabilityPartnership.findMany({
      where: {
        OR: [
          { requesterId: session.user.id },
          { partnerId: session.user.id },
        ],
        status: "ACTIVE",
      },
      include: {
        requester: {
          select: { id: true, displayName: true, firstName: true, lastName: true, name: true },
        },
        partner: {
          select: { id: true, displayName: true, firstName: true, lastName: true, name: true },
        },
      },
    });

    if (activePartnerships.length === 0) {
      return NextResponse.json(
        { error: "No active partnerships found" },
        { status: 400 }
      );
    }

    // Check if user has already checked in today for ANY partnership
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const existingCheckIn = await prisma.accountabilityCheckIn.findFirst({
      where: {
        userId: session.user.id,
        partnershipId: { in: activePartnerships.map((p) => p.id) },
        createdAt: { gte: today },
      },
    });

    if (existingCheckIn) {
      return NextResponse.json(
        { error: "Already checked in today" },
        { status: 400 }
      );
    }

    const updateContent = note.trim();

    // Calculate and update streak (same logic as updates API)
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { currentStreak: true, longestStreak: true, lastActivityDate: true },
    });

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

    // Create ONE DailyUpdate and update streak in a transaction
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

    // Create check-ins for ALL active partnerships, linked to the single DailyUpdate
    const checkInResults: string[] = [];
    for (const partnership of activePartnerships) {
      const result = await createCheckIn({
        partnershipId: partnership.id,
        userId: session.user.id,
        note: note.trim(),
        mood: mood as CheckInMood | undefined,
        imageUrl: imageUrl || undefined,
        dailyUpdateId: dailyUpdate.id,
      });

      if (result.success && result.checkInId) {
        checkInResults.push(result.checkInId);
      }
    }

    if (checkInResults.length === 0) {
      // Clean up the daily update if no check-ins were created
      await prisma.dailyUpdate.delete({ where: { id: dailyUpdate.id } }).catch(console.error);
      return NextResponse.json(
        { error: "Failed to create check-ins" },
        { status: 400 }
      );
    }

    // Get current user info for notifications
    const currentUser = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { name: true, firstName: true, lastName: true, image: true },
    });

    const userName = currentUser?.firstName && currentUser?.lastName
      ? `${currentUser.firstName} ${currentUser.lastName}`
      : currentUser?.name || "Your partner";

    // Notify each partner (deduplicated)
    const notifiedPartnerIds = new Set<string>();
    for (const partnership of activePartnerships) {
      const partnerId = partnership.requesterId === session.user.id
        ? partnership.partnerId
        : partnership.requesterId;

      // Skip if we already notified this partner (shouldn't happen but just in case)
      if (notifiedPartnerIds.has(partnerId)) continue;
      notifiedPartnerIds.add(partnerId);

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
    }

    return NextResponse.json({
      success: true,
      checkInCount: checkInResults.length,
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
