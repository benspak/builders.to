"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AdCard } from "@/components/ads";

type AdStatus = "DRAFT" | "PENDING_PAYMENT" | "ACTIVE" | "EXPIRED" | "CANCELLED";

interface Advertisement {
  id: string;
  title: string;
  description: string | null;
  imageUrl: string | null;
  linkUrl: string;
  ctaText: string;
  status: AdStatus;
  startDate: string | null;
  endDate: string | null;
  createdAt: string;
  _count: {
    views: number;
  };
}

interface AdsListProps {
  initialAds: Advertisement[];
}

export function AdsList({ initialAds }: AdsListProps) {
  const router = useRouter();
  const [ads, setAds] = useState(initialAds);

  const handleDelete = (deletedId: string) => {
    // Optimistically remove the ad from the list
    setAds((prevAds) => prevAds.filter((ad) => ad.id !== deletedId));
    // Refresh server data
    router.refresh();
  };

  return (
    <div className="space-y-4">
      {ads.map((ad) => (
        <AdCard
          key={ad.id}
          ad={ad}
          onDelete={handleDelete}
        />
      ))}
    </div>
  );
}
