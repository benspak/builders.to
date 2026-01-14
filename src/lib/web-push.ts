import webPush from 'web-push';

// Initialize web-push with VAPID keys
// Generate keys with: npx web-push generate-vapid-keys
const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || '';
const vapidPrivateKey = process.env.VAPID_PRIVATE_KEY || '';

if (vapidPublicKey && vapidPrivateKey) {
  webPush.setVapidDetails(
    'mailto:support@builders.to',
    vapidPublicKey,
    vapidPrivateKey
  );
}

export interface PushPayload {
  title: string;
  body: string;
  icon?: string;
  badge?: string;
  url?: string;
  tag?: string;
  data?: Record<string, unknown>;
}

export interface PushSubscriptionData {
  endpoint: string;
  keys: {
    p256dh: string;
    auth: string;
  };
}

/**
 * Send a push notification to a single subscription
 */
export async function sendPushNotification(
  subscription: PushSubscriptionData,
  payload: PushPayload
): Promise<boolean> {
  if (!vapidPublicKey || !vapidPrivateKey) {
    console.warn('[Push] VAPID keys not configured');
    return false;
  }

  try {
    const pushPayload = JSON.stringify({
      title: payload.title,
      body: payload.body,
      icon: payload.icon || '/icons/icon-192x192.png',
      badge: payload.badge || '/icons/icon-96x96.png',
      url: payload.url || '/',
      tag: payload.tag,
      ...payload.data,
    });

    await webPush.sendNotification(
      {
        endpoint: subscription.endpoint,
        keys: subscription.keys,
      },
      pushPayload,
      {
        TTL: 60 * 60 * 24, // 24 hours
        urgency: 'normal',
      }
    );

    return true;
  } catch (error: unknown) {
    const err = error as { statusCode?: number };
    // Handle expired/invalid subscriptions
    if (err.statusCode === 404 || err.statusCode === 410) {
      console.log('[Push] Subscription expired or invalid:', subscription.endpoint);
      return false;
    }

    console.error('[Push] Failed to send notification:', error);
    return false;
  }
}

/**
 * Send push notifications to multiple subscriptions
 * Returns the number of successful sends
 */
export async function sendPushNotifications(
  subscriptions: PushSubscriptionData[],
  payload: PushPayload
): Promise<{ successful: number; failed: string[] }> {
  const results = await Promise.allSettled(
    subscriptions.map((sub) => sendPushNotification(sub, payload))
  );

  const failed: string[] = [];
  let successful = 0;

  results.forEach((result, index) => {
    if (result.status === 'fulfilled' && result.value) {
      successful++;
    } else {
      failed.push(subscriptions[index].endpoint);
    }
  });

  return { successful, failed };
}

/**
 * Get the public VAPID key for client-side subscription
 */
export function getVapidPublicKey(): string {
  return vapidPublicKey;
}

/**
 * Check if push notifications are configured
 */
export function isPushConfigured(): boolean {
  return Boolean(vapidPublicKey && vapidPrivateKey);
}
