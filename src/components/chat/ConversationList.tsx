"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/cn";
import { Icon, ICON_PATHS } from "@/components/ui/Icon";
import type { Conversation } from "@/types/chat.types";

interface ConversationListProps {
  conversations: Conversation[];
  isCollapsed?: boolean;
}

export function ConversationList({ conversations, isCollapsed = false }: ConversationListProps) {
  const pathname = usePathname();
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState<"all" | "unread">("all");

  const filteredConversations = conversations.filter((conv) => {
    const matchesSearch = conv.participant.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = activeFilter === "all" ||
      (activeFilter === "unread" && conv.unreadCount > 0);
    return matchesSearch && matchesFilter;
  });

  function isActiveConversation(id: string): boolean {
    return pathname === `/app/chat/${id}`;
  }

  // Collapsed view - just avatars
  if (isCollapsed) {
    return (
      <div className="flex flex-col h-full bg-background py-4">
        {/* Conversation avatars */}
        <div className="flex-1 overflow-y-auto px-2 space-y-3">
          {conversations.slice(0, 8).map((conv) => (
            <Link
              key={conv.id}
              href={`/app/chat/${conv.id}`}
              className="relative flex justify-center group"
              title={conv.participant.name}
            >
              <div
                className={cn(
                  "w-11 h-11 rounded-full flex items-center justify-center",
                  "transition-all duration-200",
                  "shadow-[3px_3px_6px_#d1d5db,-3px_-3px_6px_#ffffff]",
                  isActiveConversation(conv.id)
                    ? "bg-primary text-white scale-105"
                    : "bg-white text-text-primary group-hover:shadow-[4px_4px_8px_#d1d5db,-4px_-4px_8px_#ffffff]"
                )}
              >
                <span className="text-xs font-bold">
                  {conv.participant.avatar}
                </span>
              </div>
              {conv.unreadCount > 0 && (
                <span className="absolute -top-1 -right-0 w-5 h-5 bg-primary text-white text-[10px] font-bold rounded-full flex items-center justify-center shadow-sm">
                  {conv.unreadCount}
                </span>
              )}
              {conv.participant.isOnline && (
                <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-background rounded-full" />
              )}
            </Link>
          ))}
        </div>
      </div>
    );
  }

  // Full expanded view
  return (
    <div className="flex flex-col h-full bg-white">
      {/* Header */}
      <div className="p-4 border-b border-border-light">
        <h2 className="text-lg font-bold text-text-primary mb-4">Messages</h2>

        {/* Search */}
        <div
          className={cn(
            "flex items-center gap-2 px-3 py-2.5 rounded-xl",
            "bg-background",
            "shadow-[inset_2px_2px_4px_#d1d5db,inset_-2px_-2px_4px_#ffffff]"
          )}
        >
          <Icon path={ICON_PATHS.search} size="sm" className="text-text-secondary" />
          <input
            type="text"
            placeholder="Search conversations..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-1 bg-transparent text-sm text-text-primary placeholder:text-text-secondary/60 outline-none"
          />
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="px-4 py-3 border-b border-border-light">
        <div className="flex gap-2">
          {(["all", "unread"] as const).map((filter) => (
            <button
              key={filter}
              type="button"
              onClick={() => setActiveFilter(filter)}
              className={cn(
                "px-4 py-1.5 rounded-lg text-xs font-medium capitalize",
                "transition-all duration-200 cursor-pointer",
                activeFilter === filter
                  ? "bg-primary text-white shadow-[2px_2px_4px_#d1d5db,-2px_-2px_4px_#ffffff]"
                  : "bg-background text-text-secondary hover:text-text-primary shadow-[inset_1px_1px_2px_#d1d5db,inset_-1px_-1px_2px_#ffffff]"
              )}
            >
              {filter}
            </button>
          ))}
        </div>
      </div>

      {/* Conversations List */}
      <div className="flex-1 overflow-y-auto p-2">
        {filteredConversations.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-32 text-text-secondary">
            <Icon path={ICON_PATHS.chat} size="lg" className="mb-2 opacity-50" />
            <p className="text-sm">No conversations found</p>
          </div>
        ) : (
          <div className="space-y-2">
            {filteredConversations.map((conv) => (
              <Link
                key={conv.id}
                href={`/app/chat/${conv.id}`}
                className={cn(
                  "flex items-center gap-3 p-3 rounded-xl",
                  "transition-all duration-200",
                  isActiveConversation(conv.id)
                    ? "bg-primary/10 shadow-[inset_2px_2px_4px_#d1d5db,inset_-2px_-2px_4px_#ffffff]"
                    : "hover:bg-background hover:shadow-[2px_2px_4px_#d1d5db,-2px_-2px_4px_#ffffff]"
                )}
              >
                {/* Avatar */}
                <div className="relative flex-shrink-0">
                  <div
                    className={cn(
                      "w-12 h-12 rounded-full flex items-center justify-center",
                      "bg-gradient-to-br from-primary/20 to-accent/20",
                      "shadow-[2px_2px_4px_#d1d5db,-2px_-2px_4px_#ffffff]"
                    )}
                  >
                    <span className="text-sm font-semibold text-text-primary">
                      {conv.participant.avatar}
                    </span>
                  </div>
                  {conv.participant.isOnline && (
                    <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full" />
                  )}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-0.5">
                    <h3 className={cn(
                      "font-medium text-sm truncate",
                      conv.unreadCount > 0 ? "text-text-primary font-semibold" : "text-text-primary"
                    )}>
                      {conv.participant.name}
                    </h3>
                    <span className="text-[11px] text-text-secondary flex-shrink-0 ml-2">
                      {conv.lastMessageTime}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <p className={cn(
                      "text-xs truncate pr-2",
                      conv.unreadCount > 0 ? "text-text-secondary" : "text-text-secondary/70"
                    )}>
                      {conv.isTyping ? (
                        <span className="text-primary italic flex items-center gap-1">
                          <span className="flex gap-0.5">
                            <span className="w-1 h-1 bg-primary rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                            <span className="w-1 h-1 bg-primary rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                            <span className="w-1 h-1 bg-primary rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                          </span>
                          typing...
                        </span>
                      ) : (
                        conv.lastMessage
                      )}
                    </p>
                    {conv.unreadCount > 0 && (
                      <span
                        className={cn(
                          "flex-shrink-0 min-w-[20px] h-5 px-1.5",
                          "bg-primary text-white text-[10px] font-bold",
                          "rounded-full flex items-center justify-center"
                        )}
                      >
                        {conv.unreadCount}
                      </span>
                    )}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
