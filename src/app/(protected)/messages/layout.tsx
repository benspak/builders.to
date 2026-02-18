import { Metadata } from "next";
import { ChatProvider } from "@/components/chat/chat-provider";
import { ChatLayoutWithContext } from "@/components/chat/chat-layout";

export const metadata: Metadata = {
  title: "Chat | Builders",
  description: "Real-time chat with the builder community",
};

export default function MessagesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ChatProvider>
      <ChatLayoutWithContext>{children}</ChatLayoutWithContext>
    </ChatProvider>
  );
}
