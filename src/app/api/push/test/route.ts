import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { sendUserPushNotification } from '@/lib/push-notifications';

// Test endpoint to send yourself a test notification
export async function POST() {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const result = await sendUserPushNotification(session.user.id, {
      title: 'Test Notification 🔔',
      body: 'Push notifications are working! You\'ll receive updates about likes, comments, and more.',
      url: '/notifications',
      tag: 'test',
    });

    if (result.sent) {
      return NextResponse.json({
        success: true,
        message: `Test notification sent to ${result.count} device(s)`,
      });
    } else {
      return NextResponse.json({
        success: false,
        message: 'No push subscriptions found. Make sure notifications are enabled.',
      });
    }
  } catch (error) {
    console.error('[Push Test] Error:', error);
    return NextResponse.json(
      { error: 'Failed to send test notification' },
      { status: 500 }
    );
  }
}
