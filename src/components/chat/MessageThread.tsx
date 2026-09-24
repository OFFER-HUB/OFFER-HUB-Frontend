"use client";

import { useEffect, useRef } from "react";
import { cn } from "@/lib/cn";
import { MessageBubble } from "@/components/chat/MessageBubble";
import { TypingIndicator } from "@/components/chat/TypingIndicator";
import { ICON_PATHS, Icon } from "@/components/ui/Icon";
import type { ChatMessage, ChatUser } from "@/types/chat.types";

interface MessageThreadProps {
  chatId: string;
  messages: ChatMessage[];
  currentUserId?: string;
  participant?: ChatUser;
  isLoading: boolean;
  hasMore: boolean;
  isTyping: boolean;
  onFetchMore: () => void;
  onRetryMessage: (tempId: string, content: string) => void;
  getMessageRef?: (message: ChatMessage) => (node: HTMLDivElement | null) => void;
}

/**
 * Parses and groups simple formatted mock timestamps into dates
 */
function getMessageDateGroup(timestamp: string): string {
  if (!timestamp) return "Today";
  if (timestamp.includes("Yesterday")) {
    return "Yesterday";
  }
  if (timestamp.includes("Today")) {
    return "Today";
  }
  if (timestamp.includes(",")) {
    return timestamp.split(",")[0].trim();
  }
  // If it's a simple time like "10:15 AM"
  if (timestamp.match(/^\d{1,2}:\d{2}\s*(AM|PM)$/i)) {
    return "Today";
  }
  return timestamp;
}

export function MessageThread({
  chatId,
  messages,
  currentUserId,
  participant,
  isLoading,
  hasMore,
  isTyping,
  onFetchMore,
  onRetryMessage,
  getMessageRef,
}: MessageThreadProps): React.JSX.Element {
  const containerRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const savedScrollHeightRef = useRef<number>(0);
  const lastMessageCountRef = useRef<number>(0);

  // ── Auto-scroll to bottom on new messages ──────────────────────────────────
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const isNearBottom =
      container.scrollHeight - container.scrollTop - container.clientHeight < 250;

    const isInitialLoad = lastMessageCountRef.current === 0 && messages.length > 0;
    const isNewMessageSent = messages.length > lastMessageCountRef.current && 
      messages[messages.length - 1]?.senderId === currentUserId;

    if (isInitialLoad || isNewMessageSent || isNearBottom) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }

    lastMessageCountRef.current = messages.length;
  }, [messages, currentUserId]);

  // ── Adjust scroll top to preserve viewport position when loading old messages ────
  useEffect(() => {
    const container = containerRef.current;
    if (container && savedScrollHeightRef.current > 0) {
      const addedHeight = container.scrollHeight - savedScrollHeightRef.current;
      container.scrollTop = addedHeight;
      savedScrollHeightRef.current = 0;
    }
  }, [messages]);

  // ── Infinite scroll trigger (detecting scroll to top) ──────────────────────
  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const container = e.currentTarget;
    if (container.scrollTop <= 15 && hasMore && !isLoading) {
      savedScrollHeightRef.current = container.scrollHeight;
      onFetchMore();
    }
  };

  // Determine whether to display avatar based on sender block grouping
  function shouldShowAvatar(index: number): boolean {
    if (index === messages.length - 1) return true;
    return messages[index].senderId !== messages[index + 1].senderId;
  }

  // ── Group messages by date ────────────────────────────────────────────────
  const renderedElements: React.JSX.Element[] = [];
  let lastDateGroup = "";

  messages.forEach((message, index) => {
    const dateGroup = getMessageDateGroup(message.timestamp);
    if (dateGroup !== lastDateGroup) {
      lastDateGroup = dateGroup;
      renderedElements.push(
        <div key={`date-${dateGroup}-${index}`} className="flex items-center justify-center my-6">
          <span className="px-3 py-1 text-xs text-text-secondary bg-white rounded-full shadow-[2px_2px_4px_#d1d5db,-2px_-2px_4px_#ffffff] font-medium">
            {dateGroup}
          </span>
        </div>
      );
    }

    renderedElements.push(
      <div
        key={message.id}
        ref={getMessageRef ? getMessageRef(message) : undefined}
      >
        <MessageBubble
          message={message}
          isOwn={message.senderId === currentUserId}
          showAvatar={shouldShowAvatar(index)}
          participantAvatar={participant?.avatar ?? "?"}
          onRetry={onRetryMessage}
        />
      </div>
    );
  });

  return (
    <div
      ref={containerRef}
      onScroll={handleScroll}
      className={cn(
        "flex-1 overflow-y-auto p-4 sm:p-6 min-h-0 relative",
        "bg-background"
      )}
      style={{ contain: "content" }} // Scroll performance optimization
    >
      {/* Loading older spinner */}
      {hasMore && (
        <div className="flex justify-center mb-4 transition-all duration-200">
          <button
            type="button"
            disabled={isLoading}
            onClick={() => onFetchMore()}
            className={cn(
              "px-4 py-1.5 rounded-lg text-xs font-semibold cursor-pointer",
              "text-primary bg-white flex items-center gap-1.5",
              "shadow-[2px_2px_4px_#d1d5db,-2px_-2px_4px_#ffffff]",
              "hover:shadow-[3px_3px_6px_#d1d5db,-3px_-3px_6px_#ffffff]",
              "transition-all duration-200",
              isLoading && "opacity-60 cursor-not-allowed"
            )}
          >
            {isLoading ? (
              <>
                <span className="w-3.5 h-3.5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                <span>Loading older messages…</span>
              </>
            ) : (
              <span>Load older messages</span>
            )}
          </button>
        </div>
      )}

      {/* Messages list */}
      <div className="space-y-4">
        {renderedElements}

        {isTyping && participant && (
          <div className="animate-fade-in-up stagger-1">
            <TypingIndicator name={participant.name} />
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>
    </div>
  );
}
