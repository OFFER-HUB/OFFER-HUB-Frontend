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

  const filteredConversations = conversations.filter((conv) =>
    conv.participant.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  function isActiveConversation(id: string): boolean {
    return pathname === `/app/chat/${id}`;
  }

  if (isCollapsed) {
    return (
      <div className="flex flex-col items-center py-4 gap-3">
        {conversations.slice(0, 6).map((conv) => (
          <Link
            key={conv.id}
            href={`/app/chat/${conv.id}`}
            className={cn(
              "relative w-10 h-10 rounded-full flex items-center justify-center",
              "shadow-[3px_3px_6px_#d1d5db,-3px_-3px_6px_#ffffff]",
              "hover:shadow-[4px_4px_8px_#d1d5db,-4px_-4px_8px_#ffffff]",
              "transition-all duration-200",
              isActiveConversation(conv.id) && "ring-2 ring-primary"
            )}
            title={conv.participant.name}
          >
            <span className="text-sm font-semibold text-text-primary">
              {conv.participant.avatar}
            </span>
            {conv.unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-primary text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                {conv.unreadCount}
              </span>
            )}
            {conv.participant.isOnline && (
              <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 border-2 border-white rounded-full" />
            )}
          </Link>
        ))}
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b border-border-light">
        <h2 className="text-lg font-bold text-text-primary mb-4">Messages</h2>

        {/* Search */}
        <div
          className={cn(
            "flex items-center gap-2 px-3 py-2 rounded-xl",
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
                  "flex items-start gap-3 p-3 rounded-xl",
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
                      "bg-gradient-to-br from-primary/20 to-secondary/20",
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
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="font-semibold text-text-primary text-sm truncate">
                      {conv.participant.name}
                    </h3>
                    <span className="text-xs text-text-secondary flex-shrink-0 ml-2">
                      {conv.lastMessageTime}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-text-secondary truncate pr-2">
                      {conv.isTyping ? (
                        <span className="text-primary italic">typing...</span>
                      ) : (
                        conv.lastMessage
                      )}
                    </p>
                    {conv.unreadCount > 0 && (
                      <span
                        className={cn(
                          "flex-shrink-0 min-w-[20px] h-5 px-1.5",
                          "bg-primary text-white text-xs font-bold",
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
