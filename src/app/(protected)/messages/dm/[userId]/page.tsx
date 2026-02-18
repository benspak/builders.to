"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

export default function DMPage() {
  const params = useParams();
  const router = useRouter();
  const targetUserId = params.userId as string;
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function findOrCreateDM() {
      try {
        const res = await fetch("/api/chat/dm", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userId: targetUserId }),
        });
        const channel = await res.json();
        if (channel.id) {
          router.replace(`/messages/${channel.id}`);
        }
      } catch (error) {
        console.error("Failed to create DM:", error);
        router.push("/messages");
      } finally {
        setIsLoading(false);
      }
    }
    findOrCreateDM();
  }, [targetUserId, router]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="h-8 w-8 animate-spin text-cyan-500" />
      </div>
    );
  }

  return null;
}
