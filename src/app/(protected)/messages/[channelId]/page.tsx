"use client";

import { useParams } from "next/navigation";
import { ChannelView } from "@/components/chat/channel-view";

export default function ChannelPage() {
  const params = useParams();
  const channelId = params.channelId as string;

  return <ChannelView channelId={channelId} />;
}
