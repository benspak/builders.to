'use client';

import { WifiOff, RefreshCw } from 'lucide-react';

export default function OfflinePage() {
  const handleRefresh = () => {
    window.location.reload();
  };

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-4 text-center">
      <div className="mb-6 rounded-full bg-orange-500/10 p-6">
        <WifiOff className="h-16 w-16 text-orange-500" />
      </div>

      <h1 className="mb-4 text-3xl font-bold">You&apos;re Offline</h1>

      <p className="mb-8 max-w-md text-gray-400">
        It looks like you&apos;ve lost your internet connection.
        Some features may not be available until you&apos;re back online.
      </p>

      <button
        onClick={handleRefresh}
        className="flex items-center gap-2 rounded-lg bg-orange-500 px-6 py-3 font-medium text-white transition-colors hover:bg-orange-600"
      >
        <RefreshCw className="h-5 w-5" />
        Try Again
      </button>

      <p className="mt-8 text-sm text-gray-500">
        The app will automatically reconnect when your connection is restored.
      </p>
    </div>
  );
}
