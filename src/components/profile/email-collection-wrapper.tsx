"use client";

import { useState, useEffect } from "react";
import { EmailRequiredModal } from "./email-required-modal";

interface EmailCollectionWrapperProps {
  userId: string;
  userEmail: string | null;
  emailVerified: boolean;
  children: React.ReactNode;
}

export function EmailCollectionWrapper({
  userId,
  userEmail,
  emailVerified,
  children,
}: EmailCollectionWrapperProps) {
  const [showModal, setShowModal] = useState(false);
  const [isVerified, setIsVerified] = useState(emailVerified);

  useEffect(() => {
    // Show modal if user doesn't have a verified email
    // Either: no email at all, or email exists but not verified
    if (!isVerified) {
      // Small delay to let the page render first
      const timer = setTimeout(() => setShowModal(true), 500);
      return () => clearTimeout(timer);
    }
  }, [isVerified]);

  const handleComplete = () => {
    // Only close modal when email is successfully verified
    setIsVerified(true);
    setShowModal(false);
  };

  // If user doesn't have verified email, blur the content behind the modal
  const needsVerification = !isVerified;

  return (
    <>
      <div className={needsVerification && showModal ? "pointer-events-none select-none" : ""}>
        {children}
      </div>
      {showModal && (
        <EmailRequiredModal 
          userId={userId} 
          onComplete={handleComplete}
          pendingVerificationEmail={userEmail && !emailVerified ? userEmail : null}
        />
      )}
    </>
  );
}
