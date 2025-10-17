'use client';

import { ReactNode } from "react";
import ExitIntentPopup from "./ExitIntentPopup";
import { useExitIntent } from "@/hooks/useExitIntent";

interface ResourcePageWrapperProps {
  children: ReactNode;
  resourceTitle: string;
  delay?: number;
  className?: string;
}

export default function ResourcePageWrapper({
  children,
  resourceTitle,
  delay = 7,
  className = ""
}: ResourcePageWrapperProps) {
  const { showPopup, closePopup } = useExitIntent({
    resourceTitle,
    delay
  });

  return (
    <>
      <div className={className}>
        {children}
      </div>

      {/* Exit Intent Popup */}
      {showPopup && (
        <ExitIntentPopup
          onClose={closePopup}
          resourceTitle={resourceTitle}
        />
      )}
    </>
  );
}
