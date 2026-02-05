"use client";

import { useState } from "react";
import { Users } from "lucide-react";
import { PartnerRequestModal } from "./partner-request-modal";
import { cn } from "@/lib/utils";

interface ProfilePartnerButtonProps {
  partnerId: string;
  partnerName: string;
  partnerImage: string | null;
  partnerSlug: string | null;
  className?: string;
}

export function ProfilePartnerButton({
  partnerId,
  partnerName,
  partnerImage,
  partnerSlug,
  className,
}: ProfilePartnerButtonProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [requestSent, setRequestSent] = useState(false);

  const handleSuccess = () => {
    setRequestSent(true);
  };

  if (requestSent) {
    return (
      <button
        disabled
        className={cn(
          "inline-flex items-center gap-2 rounded-xl bg-green-500/20 border border-green-500/50 px-4 py-2 text-sm font-medium text-green-300 cursor-default backdrop-blur-sm",
          className
        )}
      >
        <Users className="h-4 w-4" />
        Request Sent
      </button>
    );
  }

  return (
    <>
      <button
        onClick={() => setIsModalOpen(true)}
        className={cn(
          "inline-flex items-center gap-2 rounded-xl bg-green-500/20 border border-green-500/50 px-4 py-2 text-sm font-medium text-green-300 hover:bg-green-500/30 hover:border-green-500/60 transition-all backdrop-blur-sm",
          className
        )}
      >
        <Users className="h-4 w-4" />
        Partner Up
      </button>

      <PartnerRequestModal
        partnerId={partnerId}
        partnerName={partnerName}
        partnerImage={partnerImage}
        partnerSlug={partnerSlug}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={handleSuccess}
      />
    </>
  );
}
