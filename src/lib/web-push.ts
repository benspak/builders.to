import {
  buildPushPayload,
  type PushSubscription,
  type PushMessage,
  type VapidKeys,
} from "@block65/webcrypto-web-push";

const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || "";
const vapidPrivateKey = process.env.VAPID_PRIVATE_KEY || "";

function getVapid(): VapidKeys | null {
  if (!vapidPublicKey || !vapidPrivateKey) return null;
  return {
    subject: "mailto:support@builders.to",
    publicKey: vapidPublicKey,
    privateKey: vapidPrivateKey,
  };
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
  const vapid = getVapid();
  if (!vapid) {
    console.warn("[Push] VAPID keys not configured");
    return false;
  }

  try {
    const pushPayload = JSON.stringify({
      title: payload.title,
      body: payload.body,
      icon: payload.icon || "/icons/icon-192x192.png",
      badge: payload.badge || "/icons/icon-96x96.png",
      url: payload.url || "/",
      tag: payload.tag,
      ...payload.data,
    });

    const pushSubscription: PushSubscription = {
      endpoint: subscription.endpoint,
      expirationTime: null,
      keys: {
        p256dh: subscription.keys.p256dh,
        auth: subscription.keys.auth,
      },
    };

    const message: PushMessage = {
      data: pushPayload,
      options: {
        ttl: 60 * 60 * 24, // 24 hours
      },
    };

    const requestInit = await buildPushPayload(message, pushSubscription, vapid);
    const res = await fetch(subscription.endpoint, requestInit);

    if (res.status === 404 || res.status === 410) {
      console.log("[Push] Subscription expired or invalid:", subscription.endpoint);
      return false;
    }

    if (!res.ok) {
      console.error("[Push] Failed to send:", res.status, await res.text());
      return false;
    }

    return true;
  } catch (error) {
    console.error("[Push] Failed to send notification:", error);
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
    if (result.status === "fulfilled" && result.value) {
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
