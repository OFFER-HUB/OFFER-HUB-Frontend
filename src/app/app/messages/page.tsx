"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { cn } from "@/lib/cn";
import { Icon, ICON_PATHS, LoadingSpinner } from "@/components/ui/Icon";
import { NEUMORPHIC_CARD, NEUMORPHIC_INSET } from "@/lib/styles";

interface Conversation {
  id: string;
  name: string;
  avatar: string;
  lastMessage: string;
  time: string;
  unread: number;
}

const MOCK_CONVERSATIONS: Conversation[] = [
  {
    id: "1",
    name: "Sarah Chen",
    avatar: "SC",
    lastMessage: "Thanks for reaching out! I'd love to discuss your project.",
    time: "2m ago",
    unread: 2,
  },
  {
    id: "2",
    name: "Marcus Johnson",
    avatar: "MJ",
    lastMessage: "The designs are ready for review.",
    time: "1h ago",
    unread: 0,
  },
  {
    id: "3",
    name: "Elena Rodriguez",
    avatar: "ER",
    lastMessage: "Let me know if you need any revisions.",
    time: "3h ago",
    unread: 0,
  },
];

function ConversationItem({ conversation, isActive }: { conversation: Conversation; isActive: boolean }) {
  return (
    <div
      className={cn(
        "flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all",
        isActive ? NEUMORPHIC_INSET : "hover:bg-background"
      )}
    >
      <div
        className={cn(
          "w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0",
          "bg-primary text-white font-semibold text-sm"
        )}
      >
        {conversation.avatar}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between">
          <h3 className="font-medium text-text-primary text-sm">{conversation.name}</h3>
          <span className="text-xs text-text-secondary">{conversation.time}</span>
        </div>
        <p className="text-sm text-text-secondary truncate">{conversation.lastMessage}</p>
      </div>
      {conversation.unread > 0 && (
        <div className="w-5 h-5 rounded-full bg-primary text-white text-xs flex items-center justify-center">
          {conversation.unread}
        </div>
      )}
    </div>
  );
}

function MessagesContent(): React.JSX.Element {
  const searchParams = useSearchParams();
  const userId = searchParams.get("user");

  return (
    <div className="h-[calc(100vh-theme(spacing.32))]">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-text-primary">Messages</h1>
        <p className="text-text-secondary mt-1">Chat with freelancers and clients</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100%-5rem)]">
        {/* Conversations List */}
        <div className={cn(NEUMORPHIC_CARD, "lg:col-span-1 overflow-hidden flex flex-col")}>
          <div className="mb-4">
            <div
              className={cn(
                "flex items-center gap-2 px-3 py-2 rounded-xl",
                "shadow-[inset_2px_2px_4px_#d1d5db,inset_-2px_-2px_4px_#ffffff]"
              )}
            >
              <Icon path={ICON_PATHS.search} size="sm" className="text-text-secondary" />
              <input
                type="text"
                placeholder="Search conversations..."
                className="flex-1 bg-transparent text-sm outline-none text-text-primary placeholder:text-text-secondary"
              />
            </div>
          </div>
          <div className="flex-1 overflow-y-auto space-y-2">
            {MOCK_CONVERSATIONS.map((conversation) => (
              <ConversationItem
                key={conversation.id}
                conversation={conversation}
                isActive={conversation.id === userId}
              />
            ))}
          </div>
        </div>

        {/* Chat Area */}
        <div className={cn(NEUMORPHIC_CARD, "lg:col-span-2 flex flex-col overflow-hidden")}>
          {userId ? (
            <>
              {/* Chat Header */}
              <div className="flex items-center gap-3 pb-4 border-b border-border-light">
                <div
                  className={cn(
                    "w-10 h-10 rounded-full flex items-center justify-center",
                    "bg-primary text-white font-semibold"
                  )}
                >
                  {MOCK_CONVERSATIONS.find((c) => c.id === userId)?.avatar || "?"}
                </div>
                <div>
                  <h2 className="font-semibold text-text-primary">
                    {MOCK_CONVERSATIONS.find((c) => c.id === userId)?.name || "New Conversation"}
                  </h2>
                  <p className="text-sm text-text-secondary">Online</p>
                </div>
              </div>

              {/* Messages Area */}
              <div className="flex-1 py-4 overflow-y-auto">
                <div className="flex flex-col items-center justify-center h-full text-center">
                  <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                    <Icon path={ICON_PATHS.chat} size="xl" className="text-primary" />
                  </div>
                  <p className="text-text-secondary">Start a conversation</p>
                  <p className="text-sm text-text-secondary mt-1">
                    Send a message to begin chatting
                  </p>
                </div>
              </div>

              {/* Message Input */}
              <div className="pt-4 border-t border-border-light">
                <div
                  className={cn(
                    "flex items-center gap-3 px-4 py-3 rounded-xl",
                    "shadow-[inset_2px_2px_4px_#d1d5db,inset_-2px_-2px_4px_#ffffff]"
                  )}
                >
                  <input
                    type="text"
                    placeholder="Type a message..."
                    className="flex-1 bg-transparent outline-none text-text-primary placeholder:text-text-secondary"
                  />
                  <button
                    className={cn(
                      "p-2 rounded-lg bg-primary text-white cursor-pointer",
                      "shadow-[2px_2px_4px_#d1d5db,-2px_-2px_4px_#ffffff]",
                      "hover:shadow-[4px_4px_8px_#d1d5db,-4px_-4px_8px_#ffffff]",
                      "transition-all"
                    )}
                  >
                    <Icon path={ICON_PATHS.chat} size="sm" />
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center">
              <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                <Icon path={ICON_PATHS.chat} size="xl" className="text-primary" />
              </div>
              <h2 className="text-lg font-semibold text-text-primary mb-2">Your Messages</h2>
              <p className="text-text-secondary text-center max-w-xs">
                Select a conversation from the list or contact a freelancer to start chatting
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function MessagesLoading(): React.JSX.Element {
  return (
    <div className="flex items-center justify-center h-[calc(100vh-theme(spacing.32))]">
      <LoadingSpinner />
    </div>
  );
}

export default function MessagesPage(): React.JSX.Element {
  return (
    <Suspense fallback={<MessagesLoading />}>
      <MessagesContent />
    </Suspense>
  );
}
