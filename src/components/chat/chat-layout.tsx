"use client";

import { useState, ReactNode } from "react";
import { ChatSidebar } from "./chat-sidebar";
import { ThreadPanel } from "./thread-panel";

interface ChatLayoutProps {
  children: ReactNode;
}

export interface ThreadContext {
  messageId: string;
  channelId: string;
}

export function ChatLayout({ children }: ChatLayoutProps) {
  const [activeThread, setActiveThread] = useState<ThreadContext | null>(null);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  return (
    <div className="flex h-[calc(100vh-64px)] overflow-hidden bg-zinc-950">
      {/* Sidebar */}
      <ChatSidebar
        collapsed={sidebarCollapsed}
        onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
      />

      {/* Main content */}
      <div className="flex flex-1 min-w-0">
        <div className="flex-1 min-w-0">{children}</div>

        {/* Thread panel */}
        {activeThread && (
          <ThreadPanel
            messageId={activeThread.messageId}
            channelId={activeThread.channelId}
            onClose={() => setActiveThread(null)}
          />
        )}
      </div>
    </div>
  );
}

// Context for sharing thread state
import { createContext, useContext } from "react";

const ThreadStateContext = createContext<{
  activeThread: ThreadContext | null;
  openThread: (messageId: string, channelId: string) => void;
  closeThread: () => void;
}>({
  activeThread: null,
  openThread: () => {},
  closeThread: () => {},
});

export function useThreadState() {
  return useContext(ThreadStateContext);
}

export function ChatLayoutWithContext({ children }: ChatLayoutProps) {
  const [activeThread, setActiveThread] = useState<ThreadContext | null>(null);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const openThread = (messageId: string, channelId: string) => {
    setActiveThread({ messageId, channelId });
  };

  const closeThread = () => setActiveThread(null);

  return (
    <ThreadStateContext.Provider value={{ activeThread, openThread, closeThread }}>
      <div className="flex h-[calc(100vh-64px)] overflow-hidden bg-zinc-950">
        <ChatSidebar
          collapsed={sidebarCollapsed}
          onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
        />
        <div className="flex flex-1 min-w-0">
          <div className="flex-1 min-w-0">{children}</div>
          {activeThread && (
            <ThreadPanel
              messageId={activeThread.messageId}
              channelId={activeThread.channelId}
              onClose={closeThread}
            />
          )}
        </div>
      </div>
    </ThreadStateContext.Provider>
  );
}
