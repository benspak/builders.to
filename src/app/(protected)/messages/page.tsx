import { MessageSquare, Hash, ArrowRight } from "lucide-react";
import Link from "next/link";

export default function MessagesPage() {
  return (
    <div className="flex flex-col items-center justify-center h-full text-center px-8">
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-500/20 to-blue-500/20 mb-4">
        <MessageSquare className="h-8 w-8 text-cyan-400" />
      </div>
      <h2 className="text-xl font-semibold text-white mb-2">Welcome to Chat</h2>
      <p className="text-sm text-zinc-400 max-w-md mb-6">
        Join channels to connect with other builders, share knowledge, and collaborate in real-time.
      </p>
      <div className="flex gap-3">
        <Link
          href="/messages/search"
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-cyan-500/20 text-sm text-cyan-400 hover:bg-cyan-500/30 transition-colors"
        >
          <Hash className="h-4 w-4" />
          Browse Channels
        </Link>
      </div>
    </div>
  );
}
