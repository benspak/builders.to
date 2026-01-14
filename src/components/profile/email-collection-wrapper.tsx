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

  useEffect(() => {
    // Show modal if user doesn't have an email
    if (!userEmail) {
      // Small delay to let the page render first
      const timer = setTimeout(() => setShowModal(true), 500);
      return () => clearTimeout(timer);
    }
  }, [userEmail]);

  const handleComplete = () => {
    setShowModal(false);
  };

  return (
    <>
      {children}
      {showModal && (
        <EmailRequiredModal userId={userId} onComplete={handleComplete} />
      )}
    </>
  );
}
