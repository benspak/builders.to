'use client';

import { useState, useEffect, useCallback } from 'react';
import { Bell, BellOff, Smartphone, Loader2, Check, AlertCircle } from 'lucide-react';

type PermissionState = 'prompt' | 'granted' | 'denied' | 'unsupported';

interface SubscriptionInfo {
  id: string;
  endpoint: string;
  userAgent: string | null;
  createdAt: string;
}

export function NotificationSettings() {
  const [permission, setPermission] = useState<PermissionState>('prompt');
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [subscriptions, setSubscriptions] = useState<SubscriptionInfo[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isToggling, setIsToggling] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Check current notification permission and subscription status
  useEffect(() => {
    const checkStatus = async () => {
      // Check if notifications are supported
      if (!('Notification' in window) || !('serviceWorker' in navigator)) {
        setPermission('unsupported');
        setIsLoading(false);
        return;
      }

      // Get current permission
      setPermission(Notification.permission as PermissionState);

      // Check subscription status from server
      try {
        const response = await fetch('/api/push/subscribe');
        if (response.ok) {
          const data = await response.json();
          setIsSubscribed(data.subscribed);
          setSubscriptions(data.subscriptions || []);
        }
      } catch (err) {
        console.error('Failed to check subscription status:', err);
      }

      setIsLoading(false);
    };

    checkStatus();
  }, []);

  // Subscribe to push notifications
  const subscribe = useCallback(async () => {
    setIsToggling(true);
    setError(null);

    try {
      // Request notification permission if not granted
      if (Notification.permission === 'default') {
        const result = await Notification.requestPermission();
        setPermission(result as PermissionState);
        if (result !== 'granted') {
          setError('Notification permission denied');
          setIsToggling(false);
          return;
        }
      }

      if (Notification.permission === 'denied') {
        setError('Notifications are blocked. Please enable them in your browser settings.');
        setIsToggling(false);
        return;
      }

      // Get the VAPID public key
      const keyResponse = await fetch('/api/push/vapid-key');
      if (!keyResponse.ok) {
        throw new Error('Push notifications not configured on server');
      }
      const { publicKey } = await keyResponse.json();

      // Get service worker registration
      const registration = await navigator.serviceWorker.ready;

      // Subscribe to push
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(publicKey),
      });

      // Send subscription to server
      const subscriptionJson = subscription.toJSON();
      const response = await fetch('/api/push/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          endpoint: subscriptionJson.endpoint,
          keys: subscriptionJson.keys,
          userAgent: navigator.userAgent,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to save subscription');
      }

      setIsSubscribed(true);

      // Refresh subscriptions list
      const statusResponse = await fetch('/api/push/subscribe');
      if (statusResponse.ok) {
        const data = await statusResponse.json();
        setSubscriptions(data.subscriptions || []);
      }
    } catch (err) {
      console.error('Failed to subscribe:', err);
      setError(err instanceof Error ? err.message : 'Failed to enable notifications');
    }

    setIsToggling(false);
  }, []);

  // Unsubscribe from push notifications
  const unsubscribe = useCallback(async () => {
    setIsToggling(true);
    setError(null);

    try {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();

      if (subscription) {
        // Unsubscribe from browser
        await subscription.unsubscribe();

        // Remove from server
        await fetch('/api/push/subscribe', {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            endpoint: subscription.endpoint,
          }),
        });
      }

      setIsSubscribed(false);
      setSubscriptions([]);
    } catch (err) {
      console.error('Failed to unsubscribe:', err);
      setError('Failed to disable notifications');
    }

    setIsToggling(false);
  }, []);

  // Convert VAPID key from base64 to Uint8Array
  const urlBase64ToUint8Array = (base64String: string): Uint8Array => {
    const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
    const base64 = (base64String + padding)
      .replace(/-/g, '+')
      .replace(/_/g, '/');
    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);
    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
  };

  if (isLoading) {
    return (
      <div className="rounded-xl border border-white/10 bg-zinc-900/50 p-6">
        <div className="flex items-center gap-3">
          <Loader2 className="h-5 w-5 animate-spin text-orange-500" />
          <span className="text-zinc-400">Loading notification settings...</span>
        </div>
      </div>
    );
  }

  if (permission === 'unsupported') {
    return (
      <div className="rounded-xl border border-white/10 bg-zinc-900/50 p-6">
        <div className="flex items-start gap-4">
          <div className="rounded-lg bg-zinc-800 p-3">
            <BellOff className="h-6 w-6 text-zinc-500" />
          </div>
          <div>
            <h3 className="font-semibold text-white">Push Notifications</h3>
            <p className="mt-1 text-sm text-zinc-400">
              Push notifications are not supported in this browser.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-white/10 bg-zinc-900/50 p-6">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-4">
          <div className={`rounded-lg p-3 ${isSubscribed ? 'bg-orange-500/20' : 'bg-zinc-800'}`}>
            {isSubscribed ? (
              <Bell className="h-6 w-6 text-orange-500" />
            ) : (
              <BellOff className="h-6 w-6 text-zinc-500" />
            )}
          </div>
          <div>
            <h3 className="font-semibold text-white">Push Notifications</h3>
            <p className="mt-1 text-sm text-zinc-400">
              {isSubscribed
                ? 'You\'ll receive notifications for likes, comments, and other activity.'
                : 'Enable push notifications to stay updated on activity.'}
            </p>

            {permission === 'denied' && (
              <div className="mt-3 flex items-center gap-2 text-sm text-yellow-500">
                <AlertCircle className="h-4 w-4" />
                <span>Notifications are blocked in browser settings</span>
              </div>
            )}

            {error && (
              <div className="mt-3 flex items-center gap-2 text-sm text-red-400">
                <AlertCircle className="h-4 w-4" />
                <span>{error}</span>
              </div>
            )}
          </div>
        </div>

        <button
          onClick={isSubscribed ? unsubscribe : subscribe}
          disabled={isToggling || permission === 'denied'}
          className={`flex items-center gap-2 rounded-lg px-4 py-2 font-medium transition-colors ${
            isSubscribed
              ? 'bg-zinc-800 text-white hover:bg-zinc-700'
              : 'bg-orange-500 text-white hover:bg-orange-600'
          } disabled:cursor-not-allowed disabled:opacity-50`}
        >
          {isToggling ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : isSubscribed ? (
            <Check className="h-4 w-4" />
          ) : (
            <Bell className="h-4 w-4" />
          )}
          {isSubscribed ? 'Enabled' : 'Enable'}
        </button>
      </div>

      {/* Show subscribed devices and test button */}
      {isSubscribed && subscriptions.length > 0 && (
        <div className="mt-6 border-t border-white/10 pt-4">
          <div className="mb-4 flex items-center justify-between">
            <h4 className="text-sm font-medium text-zinc-400">Subscribed Devices</h4>
            <TestNotificationButton />
          </div>
          <div className="space-y-2">
            {subscriptions.map((sub) => (
              <div
                key={sub.id}
                className="flex items-center gap-3 rounded-lg bg-zinc-800/50 px-3 py-2"
              >
                <Smartphone className="h-4 w-4 text-zinc-500" />
                <span className="flex-1 truncate text-sm text-zinc-300">
                  {getBrowserFromUserAgent(sub.userAgent)}
                </span>
                <span className="text-xs text-zinc-500">
                  {new Date(sub.createdAt).toLocaleDateString()}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// Test notification button component
function TestNotificationButton() {
  const [isSending, setIsSending] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const sendTest = async () => {
    setIsSending(true);
    setMessage(null);

    try {
      const response = await fetch('/api/push/test', { method: 'POST' });
      const data = await response.json();

      if (data.success) {
        setMessage('✓ Test notification sent!');
      } else {
        setMessage(data.message || 'Failed to send');
      }
    } catch {
      setMessage('Failed to send test');
    }

    setIsSending(false);

    // Clear message after 3 seconds
    setTimeout(() => setMessage(null), 3000);
  };

  return (
    <div className="flex items-center gap-2">
      {message && (
        <span className="text-xs text-green-400">{message}</span>
      )}
      <button
        onClick={sendTest}
        disabled={isSending}
        className="flex items-center gap-1.5 rounded-md bg-zinc-800 px-3 py-1.5 text-xs font-medium text-zinc-300 transition-colors hover:bg-zinc-700 disabled:opacity-50"
      >
        {isSending ? (
          <Loader2 className="h-3 w-3 animate-spin" />
        ) : (
          <Bell className="h-3 w-3" />
        )}
        Test
      </button>
    </div>
  );
}

// Helper to extract browser name from user agent
function getBrowserFromUserAgent(userAgent: string | null): string {
  if (!userAgent) return 'Unknown Device';

  if (userAgent.includes('Chrome') && !userAgent.includes('Edg')) {
    return 'Chrome';
  } else if (userAgent.includes('Firefox')) {
    return 'Firefox';
  } else if (userAgent.includes('Safari') && !userAgent.includes('Chrome')) {
    return 'Safari';
  } else if (userAgent.includes('Edg')) {
    return 'Edge';
  } else if (userAgent.includes('Opera') || userAgent.includes('OPR')) {
    return 'Opera';
  }

  // Check for mobile
  if (userAgent.includes('Mobile')) {
    if (userAgent.includes('iPhone')) return 'iPhone';
    if (userAgent.includes('Android')) return 'Android';
    return 'Mobile Browser';
  }

  return 'Browser';
}
