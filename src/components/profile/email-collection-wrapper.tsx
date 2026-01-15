"use client";

import { useState, useEffect } from "react";
import { EmailRequiredModal } from "./email-required-modal";

interface EmailCollectionWrapperProps {
  userId: string;
  userEmail: string | null;
  children: React.ReactNode;
}

export function EmailCollectionWrapper({
  userId,
  userEmail,
  children,
}: EmailCollectionWrapperProps) {
  const [showModal, setShowModal] = useState(false);
  const [hasEmail, setHasEmail] = useState(!!userEmail);

  useEffect(() => {
    // Show modal if user doesn't have an email
    if (!userEmail && !hasEmail) {
      // Small delay to let the page render first
      const timer = setTimeout(() => setShowModal(true), 500);
      return () => clearTimeout(timer);
    }
  }, [userEmail, hasEmail]);

  const handleComplete = () => {
    // Only close modal when email is successfully saved
    setHasEmail(true);
    setShowModal(false);
  };

  // If user doesn't have email, blur the content behind the modal
  const needsEmail = !userEmail && !hasEmail;

  return (
    <>
      <div className={needsEmail && showModal ? "pointer-events-none select-none" : ""}>
        {children}
      </div>
      {showModal && (
        <EmailRequiredModal userId={userId} onComplete={handleComplete} />
      )}
    </>
  );
}
