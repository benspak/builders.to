import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { sendPushNotifications, isPushConfigured } from '@/lib/web-push';

// Internal API to send push notifications
// Used by other parts of the app to send notifications
export async function POST(request: NextRequest) {
  try {
    // Check if push is configured
    if (!isPushConfigured()) {
      return NextResponse.json(
        { error: 'Push notifications not configured' },
        { status: 503 }
      );
    }

    const session = await auth();

    // Only authenticated users can trigger notifications
    // In production, you might want to restrict this to admins or internal calls
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { userIds, title, body: notificationBody, url, tag } = body;

    if (!userIds || !Array.isArray(userIds) || userIds.length === 0) {
      return NextResponse.json(
        { error: 'userIds array required' },
        { status: 400 }
      );
    }

    if (!title || !notificationBody) {
      return NextResponse.json(
        { error: 'title and body required' },
        { status: 400 }
      );
    }

    // Get all subscriptions for the specified users
    const subscriptions = await prisma.pushSubscription.findMany({
      where: {
        userId: { in: userIds },
      },
    });

    if (subscriptions.length === 0) {
      return NextResponse.json({
        success: true,
        sent: 0,
        message: 'No push subscriptions found for users',
      });
    }

    // Transform to the format expected by web-push
    const pushSubscriptions = subscriptions.map((sub) => ({
      endpoint: sub.endpoint,
      keys: {
        p256dh: sub.p256dh,
        auth: sub.auth,
      },
    }));

    // Send notifications
    const result = await sendPushNotifications(pushSubscriptions, {
      title,
      body: notificationBody,
      url,
      tag,
    });

    // Clean up failed/expired subscriptions
    if (result.failed.length > 0) {
      await prisma.pushSubscription.deleteMany({
        where: {
          endpoint: { in: result.failed },
        },
      });
    }

    return NextResponse.json({
      success: true,
      sent: result.successful,
      failed: result.failed.length,
    });
  } catch (error) {
    console.error('[Push Send] Error:', error);
    return NextResponse.json(
      { error: 'Failed to send notifications' },
      { status: 500 }
    );
  }
}
