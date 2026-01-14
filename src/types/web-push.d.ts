// Type declarations for web-push module
declare module 'web-push' {
  interface VapidKeys {
    publicKey: string;
    privateKey: string;
  }

  interface PushSubscription {
    endpoint: string;
    keys: {
      p256dh: string;
      auth: string;
    };
  }

  interface SendOptions {
    TTL?: number;
    headers?: Record<string, string>;
    vapidDetails?: {
      subject: string;
      publicKey: string;
      privateKey: string;
    };
    proxy?: string;
    agent?: unknown;
    timeout?: number;
    urgency?: 'very-low' | 'low' | 'normal' | 'high';
    topic?: string;
  }

  interface SendResult {
    statusCode: number;
    body: string;
    headers: Record<string, string>;
  }

  export function generateVAPIDKeys(): VapidKeys;

  export function setVapidDetails(
    subject: string,
    publicKey: string,
    privateKey: string
  ): void;

  export function sendNotification(
    subscription: PushSubscription,
    payload?: string | Buffer | null,
    options?: SendOptions
  ): Promise<SendResult>;
}
