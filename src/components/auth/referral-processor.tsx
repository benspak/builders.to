"use client";

import { useEffect, useRef } from "react";

/**
 * Component that processes pending referrals after signup
 * Should be rendered once in the protected layout
 */
export function ReferralProcessor() {
  const processedRef = useRef(false);

  useEffect(() => {
    // Only process once per session
    if (processedRef.current) return;

    // Check if we've already processed in this browser session
    const processed = sessionStorage.getItem("builders_ref_processed");
    if (processed) return;

    processedRef.current = true;

    // Process the referral
    const processReferral = async () => {
      try {
        const response = await fetch("/api/referral/process", {
          method: "POST",
        });

        if (response.ok) {
          const data = await response.json();
          if (data.processed) {
            console.log("Referral processed successfully");
          }
        }
      } catch (error) {
        console.error("Failed to process referral:", error);
      } finally {
        // Mark as processed to avoid repeated calls
        sessionStorage.setItem("builders_ref_processed", "true");
      }
    };

    processReferral();
  }, []);

  // This component doesn't render anything
  return null;
}
