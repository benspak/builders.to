"use client";

import { Suspense } from "react";
import { useParams } from "next/navigation";
import { ChannelView } from "@/components/chat/channel-view";
import { Loader2 } from "lucide-react";

function ChannelContent() {
  const params = useParams();
  const channelId = params.channelId as string;
  return <ChannelView channelId={channelId} />;
}

export default function ChannelPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center h-full"><Loader2 className="h-8 w-8 animate-spin text-cyan-500" /></div>}>
      <ChannelContent />
    </Suspense>
  );
}
