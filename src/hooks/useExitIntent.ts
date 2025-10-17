'use client';

import { useEffect, useState } from 'react';

interface UseExitIntentOptions {
  resourceTitle?: string;
  delay?: number; // Delay in seconds before showing popup
}

export function useExitIntent({
  resourceTitle = "this resource",
  delay = 7 // 7 seconds delay before showing popup
}: UseExitIntentOptions = {}) {
  const [showPopup, setShowPopup] = useState(false);
  const [hasShownPopup, setHasShownPopup] = useState(false);

  useEffect(() => {
    console.log('useExitIntent: setting up timeout for', delay, 'seconds');

    // Check if user has already provided email via exit-intent
    const exitIntentCaptured = localStorage.getItem('exitIntentCaptured');
    const exitIntentDate = localStorage.getItem('exitIntentDate');

    console.log('useExitIntent: exitIntentCaptured =', exitIntentCaptured, 'exitIntentDate =', exitIntentDate);

    // Don't show if captured within last 30 days
    if (exitIntentCaptured && exitIntentDate) {
      const captureDate = new Date(exitIntentDate);
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      if (captureDate > thirtyDaysAgo) {
        console.log('useExitIntent: already captured within 30 days, not showing');
        return;
      }
    }

    // Simple timeout - just show popup after delay
    const timeoutId = setTimeout(() => {
      console.log('useExitIntent: timeout fired, showing popup!');
      if (!hasShownPopup) {
        setShowPopup(true);
        setHasShownPopup(true);
      }
    }, delay * 1000);

    return () => {
      clearTimeout(timeoutId);
    };
  }, [delay, hasShownPopup]);

  const closePopup = () => {
    setShowPopup(false);
  };

  return {
    showPopup,
    closePopup,
    resourceTitle
  };
}
