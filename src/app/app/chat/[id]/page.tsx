"use client";

import { useEffect, useState, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { cn } from "@/lib/cn";
import { Icon, ICON_PATHS } from "@/components/ui/Icon";
import { ConversationList } from "@/components/chat/ConversationList";
import { ChatHeader } from "@/components/chat/ChatHeader";
import { MessageBubble } from "@/components/chat/MessageBubble";
import { MessageInput } from "@/components/chat/MessageInput";
import { ChatInfoPanel } from "@/components/chat/ChatInfoPanel";
import {
  MOCK_CONVERSATIONS,
  MOCK_SHARED_FILES,
  getChatThreadById,
} from "@/data/chat.data";
import { useSidebarStore } from "@/stores/sidebar-store";
import type { ChatMessage } from "@/types/chat.types";

export default function ChatThreadPage() {
  const params = useParams();
  const router = useRouter();
  const { isCollapsed: sidebarCollapsed, setCollapsed: setSidebarCollapsed } = useSidebarStore();
  const [showConversations, setShowConversations] = useState(false);
  const [showInfo, setShowInfo] = useState(true);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const chatId = params.id as string;
  const chatThread = getChatThreadById(chatId);

  // Auto-collapse sidebar when entering chat
  useEffect(() => {
    setSidebarCollapsed(true);
  }, [setSidebarCollapsed]);

  // Load messages when thread changes
  useEffect(() => {
    if (chatThread) {
      setMessages(chatThread.messages);
    }
  }, [chatThread]);

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Handle when sidebar is expanded - collapse conversation list
  const conversationsCollapsed = !sidebarCollapsed;

  function handleSendMessage(content: string): void {
    const newMessage: ChatMessage = {
      id: `m${Date.now()}`,
      senderId: "current",
      content,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      isRead: false,
    };
    setMessages((prev) => [...prev, newMessage]);
  }

  if (!chatThread) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-center">
          <div
            className={cn(
              "w-20 h-20 mx-auto mb-4 rounded-full flex items-center justify-center",
              "bg-background",
              "shadow-[inset_4px_4px_8px_#d1d5db,inset_-4px_-4px_8px_#ffffff]"
            )}
          >
            <Icon path={ICON_PATHS.chat} size="xl" className="text-text-secondary" />
          </div>
          <h2 className="text-lg font-bold text-text-primary mb-2">
            Conversation not found
          </h2>
          <button
            type="button"
            onClick={() => router.push("/app/chat")}
            className={cn(
              "px-4 py-2 rounded-xl cursor-pointer",
              "bg-primary text-white text-sm font-medium",
              "shadow-[4px_4px_8px_#d1d5db,-4px_-4px_8px_#ffffff]",
              "hover:shadow-[6px_6px_12px_#d1d5db,-6px_-6px_12px_#ffffff]",
              "transition-all duration-200"
            )}
          >
            Back to Messages
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full gap-4 lg:gap-6">
      {/* Mobile Overlay */}
      {showConversations && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setShowConversations(false)}
        />
      )}

      {/* Conversation List */}
      <div
        className={cn(
          "flex-shrink-0 bg-white rounded-2xl overflow-hidden",
          "shadow-[6px_6px_12px_#d1d5db,-6px_-6px_12px_#ffffff]",
          "transition-all duration-300 ease-in-out",
          // Desktop behavior
          "hidden lg:block",
          conversationsCollapsed ? "lg:w-16" : "lg:w-80",
          // Mobile behavior (overlay)
          showConversations && "fixed inset-y-0 left-0 z-50 w-80 m-0 rounded-none block lg:relative lg:rounded-2xl"
        )}
      >
        <ConversationList
          conversations={MOCK_CONVERSATIONS}
          isCollapsed={conversationsCollapsed && !showConversations}
        />
      </div>

      {/* Chat Area */}
      <div
        className={cn(
          "flex-1 flex flex-col min-w-0",
          "bg-white rounded-2xl overflow-hidden",
          "shadow-[6px_6px_12px_#d1d5db,-6px_-6px_12px_#ffffff]"
        )}
      >
        {/* Chat Header */}
        <ChatHeader
          participant={chatThread.participant}
          onToggleSidebar={() => setShowConversations(true)}
          onToggleInfo={() => setShowInfo(!showInfo)}
          showInfoButton={true}
        />

        {/* Messages Area */}
        <div
          className={cn(
            "flex-1 overflow-y-auto p-4",
            "bg-background"
          )}
        >
          <div className="space-y-4">
            {messages.map((message) => (
              <MessageBubble
                key={message.id}
                message={message}
                isOwn={message.senderId === "current"}
              />
            ))}
            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Message Input */}
        <MessageInput onSendMessage={handleSendMessage} />
      </div>

      {/* Info Panel */}
      <div
        className={cn(
          "flex-shrink-0 rounded-2xl overflow-hidden",
          "bg-white",
          "shadow-[6px_6px_12px_#d1d5db,-6px_-6px_12px_#ffffff]",
          "transition-all duration-300 ease-in-out",
          "hidden xl:block",
          showInfo ? "xl:w-72" : "xl:w-0 xl:opacity-0"
        )}
      >
        <ChatInfoPanel
          participant={chatThread.participant}
          sharedFiles={MOCK_SHARED_FILES}
          onClose={() => setShowInfo(false)}
        />
      </div>
    </div>
  );
}
