import { prisma } from './prisma';
import { sendPushNotifications, isPushConfigured, type PushPayload } from './web-push';

/**
 * Send push notification to a specific user
 */
export async function sendUserPushNotification(
  userId: string,
  payload: PushPayload
): Promise<{ sent: boolean; count: number }> {
  if (!isPushConfigured()) {
    return { sent: false, count: 0 };
  }

  try {
    const subscriptions = await prisma.pushSubscription.findMany({
      where: { userId },
    });

    if (subscriptions.length === 0) {
      return { sent: false, count: 0 };
    }

    const pushSubscriptions = subscriptions.map((sub) => ({
      endpoint: sub.endpoint,
      keys: {
        p256dh: sub.p256dh,
        auth: sub.auth,
      },
    }));

    const result = await sendPushNotifications(pushSubscriptions, payload);

    // Clean up failed subscriptions
    if (result.failed.length > 0) {
      await prisma.pushSubscription.deleteMany({
        where: {
          endpoint: { in: result.failed },
        },
      });
    }

    return { sent: result.successful > 0, count: result.successful };
  } catch (error) {
    console.error('[Push] Error sending to user:', userId, error);
    return { sent: false, count: 0 };
  }
}

/**
 * Send push notification for a new comment on user's content
 */
export async function notifyNewComment(
  authorId: string,
  commenterName: string,
  contentTitle: string,
  url: string
): Promise<void> {
  await sendUserPushNotification(authorId, {
    title: 'New Comment',
    body: `${commenterName} commented on "${contentTitle}"`,
    url,
    tag: 'comment',
  });
}

/**
 * Send push notification when someone likes user's content
 */
export async function notifyLike(
  authorId: string,
  likerName: string,
  contentTitle: string,
  url: string
): Promise<void> {
  await sendUserPushNotification(authorId, {
    title: 'New Like',
    body: `${likerName} liked "${contentTitle}"`,
    url,
    tag: 'like',
  });
}

/**
 * Send push notification for new follower
 */
export async function notifyNewFollower(
  userId: string,
  followerName: string,
  followerUrl: string
): Promise<void> {
  await sendUserPushNotification(userId, {
    title: 'New Follower',
    body: `${followerName} started following you`,
    url: followerUrl,
    tag: 'follow',
  });
}

/**
 * Send push notification for project upvote
 */
export async function notifyProjectUpvote(
  authorId: string,
  upvoterName: string,
  projectTitle: string,
  projectUrl: string
): Promise<void> {
  await sendUserPushNotification(authorId, {
    title: 'Project Upvoted! 🚀',
    body: `${upvoterName} upvoted "${projectTitle}"`,
    url: projectUrl,
    tag: 'upvote',
  });
}

/**
 * Send push notification for milestone achievement
 */
export async function notifyMilestoneCelebration(
  authorId: string,
  celebratorName: string,
  milestoneTitle: string,
  feedUrl: string
): Promise<void> {
  await sendUserPushNotification(authorId, {
    title: 'Milestone Celebrated! 🎉',
    body: `${celebratorName} celebrated your "${milestoneTitle}" milestone`,
    url: feedUrl,
    tag: 'milestone',
  });
}
