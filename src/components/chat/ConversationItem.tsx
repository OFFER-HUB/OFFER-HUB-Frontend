"use client";

import type { Conversation } from "@/types/chat.types";
import { cn } from "@/lib/cn";

interface ConversationItemProps {
  conversation: Conversation;
  isActive: boolean;
  onSelect?: (conversationId: string) => void;
}

export function ConversationItem({
  conversation,
  isActive,
  onSelect,
}: ConversationItemProps): React.JSX.Element {
  return (
    <button
      type="button"
      onClick={() => onSelect?.(conversation.id)}
      className={cn(
        "w-full text-left flex items-center gap-3 p-3 rounded-xl",
        "transition-all duration-200 cursor-pointer",
        isActive
          ? "bg-primary/10 shadow-[inset_2px_2px_4px_#d1d5db,inset_-2px_-2px_4px_#ffffff]"
          : "hover:bg-background hover:shadow-[2px_2px_4px_#d1d5db,-2px_-2px_4px_#ffffff]"
      )}
      aria-current={isActive ? "page" : undefined}
    >
      <div className="relative shrink-0">
        <div
          className={cn(
            "w-12 h-12 rounded-full flex items-center justify-center",
            "bg-linear-to-br from-primary/20 to-accent/20",
            "shadow-[2px_2px_4px_#d1d5db,-2px_-2px_4px_#ffffff]"
          )}
        >
          <span className="text-sm font-semibold text-text-primary">
            {conversation.participant.avatar}
          </span>
        </div>
        {conversation.participant.isOnline && (
          <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full" />
        )}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-0.5">
          <h3
            className={cn(
              "font-medium text-sm truncate",
              conversation.unreadCount > 0 && "font-semibold"
            )}
          >
            {conversation.participant.name}
          </h3>
          <span className="text-[11px] text-text-secondary shrink-0 ml-2">
            {conversation.lastMessageTime}
          </span>
        </div>

        <div className="flex items-center justify-between gap-2">
          <p className="text-xs text-text-secondary truncate pr-2">
            {conversation.isTyping ? "typing..." : conversation.lastMessage}
          </p>

          {conversation.unreadCount > 0 && (
            <span
              className={cn(
                "shrink-0 min-w-5 h-5 px-1.5",
                "bg-primary text-white text-[10px] font-bold",
                "rounded-full flex items-center justify-center"
              )}
            >
              {conversation.unreadCount > 99 ? "99+" : conversation.unreadCount}
            </span>
          )}
        </div>
      </div>
    </button>
  );
}
