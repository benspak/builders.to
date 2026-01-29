import { Metadata } from "next";
import { redirect } from "next/navigation";
import { MessageSquare } from "lucide-react";
import { auth } from "@/lib/auth";
import { ConversationList } from "./conversation-list";

export const metadata: Metadata = {
  title: "Messages | Builders",
  description: "Your private messages with other builders",
};

export default async function MessagesPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/signin");
  }

  return (
    <div className="min-h-screen bg-zinc-950">
      <div className="container mx-auto max-w-4xl px-4 py-8">
        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-500/20 to-blue-500/20">
            <MessageSquare className="h-6 w-6 text-cyan-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">Messages</h1>
            <p className="text-sm text-zinc-400">
              Private conversations with builders
            </p>
          </div>
        </div>

        {/* Conversation List */}
        <ConversationList />
      </div>
    </div>
  );
}
