"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { cn } from "@/lib/cn";
import { Icon, ICON_PATHS, LoadingSpinner } from "@/components/ui/Icon";
import { ConversationList } from "@/components/chat/ConversationList";
import { ChatHeader } from "@/components/chat/ChatHeader";
import { MessageBubble } from "@/components/chat/MessageBubble";
import { MessageInput } from "@/components/chat/MessageInput";
import { ChatInfoPanel } from "@/components/chat/ChatInfoPanel";
import { TypingIndicator } from "@/components/chat/TypingIndicator";
import { ConnectionStatus } from "@/components/chat/ConnectionStatus";
import { MOCK_SHARED_FILES } from "@/data/chat.data";
import { useSidebarStore } from "@/stores/sidebar-store";
import { useAuthStore } from "@/stores/auth-store";
import { useChatStore } from "@/stores/chat-store";
import { useChatSSE } from "@/hooks/use-chat-sse";
import { useMarkAsRead } from "@/hooks/use-mark-as-read";
import { sendTypingStatus } from "@/lib/api/chat";

import { useInView } from "@/hooks/useInView";

export default function MessagesThreadPage(): React.JSX.Element {
  const params = useParams();
  const router = useRouter();
  const { setCollapsed: setSidebarCollapsed } = useSidebarStore();
  const currentUserId = useAuthStore((s) => s.user?.id);

  const [showConversations, setShowConversations] = useState(false);
  const [showInfo, setShowInfo] = useState(true);
  const [conversationsCollapsed, setConversationsCollapsed] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const chatId = params.id as string;

  // ── Store selectors ──────────────────────────────────────────────────────
  const conversations = useChatStore((s) => s.conversations);
  const messages = useChatStore((s) => s.messagesByConversation[chatId] ?? []);
  const isLoadingMessages = useChatStore((s) => s.messagesLoading[chatId] ?? false);
  const hasMoreMessages = useChatStore((s) => s.messagesHasMore[chatId] ?? false);
  const typingUsers = useChatStore((s) => s.typingUsers[chatId] ?? new Set<string>());
  const connectionStatus = useChatStore((s) => s.connectionStatus[chatId] ?? "disconnected");

  const {
    fetchConversations,
    fetchMessages,
    fetchMoreMessages,
    sendMessage,
  } = useChatStore();

  const activeConversation = conversations.find((c) => c.id === chatId);

  // ── Infinite scroll setup ────────────────────────────────────────────────
  const { ref: loadMoreRef, isInView: isLoadMoreInView } = useInView({
    threshold: 0.5,
    triggerOnce: false,
  });

  useEffect(() => {
    if (isLoadMoreInView && hasMoreMessages && !isLoadingMessages) {
      fetchMoreMessages(chatId);
    }
  }, [isLoadMoreInView, hasMoreMessages, isLoadingMessages, fetchMoreMessages, chatId]);

  // ── SSE subscription ─────────────────────────────────────────────────────
  useChatSSE({ conversationId: chatId });
  const { getMessageRef } = useMarkAsRead({
    conversationId: chatId,
    currentUserId,
  });

  // ── Bootstrap ────────────────────────────────────────────────────────────
  useEffect(() => {
    setSidebarCollapsed(true);
  }, [setSidebarCollapsed]);

  useEffect(() => {
    if (conversations.length === 0) {
      fetchConversations();
    }
  }, [conversations.length, fetchConversations]);

  useEffect(() => {
    if (chatId) {
      fetchMessages(chatId);
    }
  }, [chatId, fetchMessages]);

  // ── Auto-scroll on new messages ──────────────────────────────────────────
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // ── Handlers ─────────────────────────────────────────────────────────────
  function handleToggleConversations(): void {
    setConversationsCollapsed((prev) => !prev);
  }

  async function handleSendMessage(content: string): Promise<void> {
    await sendMessage(chatId, content);
  }

  const handleTypingChange = useCallback(
    (isTyping: boolean) => {
      sendTypingStatus(chatId, isTyping);
    },
    [chatId]
  );

  function shouldShowAvatar(index: number): boolean {
    if (index === messages.length - 1) return true;
    return messages[index].senderId !== messages[index + 1].senderId;
  }

  // ── Loading state (initial fetch) ────────────────────────────────────────
  if (isLoadingMessages && messages.length === 0) {
    return (
      <div className="page-full-height flex items-center justify-center bg-white rounded-2xl shadow-[6px_6px_12px_#d1d5db,-6px_-6px_12px_#ffffff]">
        <div className="text-center">
          <div
            className={cn(
              "w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center",
              "bg-background animate-pulse",
              "shadow-[inset_4px_4px_8px_#d1d5db,inset_-4px_-4px_8px_#ffffff]"
            )}
          >
            <Icon path={ICON_PATHS.chat} size="xl" className="text-primary/50" />
          </div>
          <p className="text-sm text-text-secondary">Loading messages…</p>
        </div>
      </div>
    );
  }

  // ── Not found (after conversations loaded) ───────────────────────────────
  if (!isLoadingMessages && !activeConversation && conversations.length > 0) {
    return (
      <div className="page-full-height flex items-center justify-center bg-white rounded-2xl shadow-[6px_6px_12px_#d1d5db,-6px_-6px_12px_#ffffff]">
        <div className="text-center">
          <div
            className={cn(
              "w-20 h-20 mx-auto mb-4 rounded-full flex items-center justify-center",
              "bg-background",
              "shadow-[inset_4px_4px_8px_#d1d5db,inset_-4px_-4px_8px_#ffffff]"
            )}
          >
            <Icon path={ICON_PATHS.chat} size="xl" className="text-primary" />
          </div>
          <h2 className="text-lg font-bold text-text-primary mb-2">
            Conversation not found
          </h2>
          <button
            type="button"
            onClick={() => router.push("/app/messages")}
            className={cn(
              "px-5 py-2.5 rounded-xl cursor-pointer",
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

  const participant = activeConversation?.participant;
  const isParticipantTyping = typingUsers.size > 0;

  return (
    <div className="page-full-height flex gap-4">
      {showConversations && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setShowConversations(false)}
        />
      )}

      {/* Conversation list sidebar */}
      <div
        className={cn(
          "flex-shrink-0 bg-white rounded-2xl overflow-hidden",
          "shadow-[6px_6px_12px_#d1d5db,-6px_-6px_12px_#ffffff]",
          "transition-all duration-300 ease-in-out",
          "hidden lg:block",
          conversationsCollapsed ? "lg:w-[80px]" : "lg:w-[340px]",
          showConversations &&
            "fixed inset-y-0 left-0 z-50 w-[340px] m-0 rounded-none block lg:relative lg:rounded-2xl"
        )}
      >
        <ConversationList
          isCollapsed={conversationsCollapsed && !showConversations}
          onToggleCollapse={handleToggleConversations}
        />
      </div>

      {/* Main chat panel */}
      <div
        className={cn(
          "flex-1 flex flex-col min-w-0 min-h-0",
          "bg-white rounded-2xl overflow-hidden",
          "shadow-[6px_6px_12px_#d1d5db,-6px_-6px_12px_#ffffff]"
        )}
      >
        {/* Header row with connection status */}
        <div className="flex items-center border-b border-border-light">
          <div className="flex-1 min-w-0">
            {participant && (
              <ChatHeader
                participant={participant}
                onToggleSidebar={() => setShowConversations(true)}
                onToggleInfo={() => setShowInfo(!showInfo)}
                showInfoButton={true}
              />
            )}
          </div>
          <ConnectionStatus status={connectionStatus} className="mr-4 flex-shrink-0" />
        </div>

        {/* Load older messages trigger */}
        {hasMoreMessages && (
          <div ref={loadMoreRef} className="flex justify-center py-4">
            <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-background shadow-inner">
              <LoadingSpinner className="w-4 h-4 text-primary" />
              <span className="text-xs text-text-secondary font-medium">Loading history…</span>
            </div>
          </div>
        )}

        {/* Message list */}
        <div
          className={cn(
            "flex-1 overflow-y-auto p-4 sm:p-6 min-h-0",
            "bg-background"
          )}
        >
          <div className="flex items-center justify-center mb-6">
            <span className="px-3 py-1 text-xs text-text-secondary bg-white rounded-full shadow-[2px_2px_4px_#d1d5db,-2px_-2px_4px_#ffffff]">
              Today
            </span>
          </div>

          <div className="space-y-4">
            {messages.map((message, index) => (
              <div key={message.id} ref={getMessageRef(message)}>
                <MessageBubble
                  message={message}
                  isOwn={message.senderId === currentUserId}
                  showAvatar={shouldShowAvatar(index)}
                  participantAvatar={participant?.avatar ?? "?"}
                />
              </div>
            ))}

            {isParticipantTyping && participant && (
              <TypingIndicator name={participant.name} />
            )}

            <div ref={messagesEndRef} />
          </div>
        </div>

        <MessageInput
          onSendMessage={handleSendMessage}
          onTypingChange={handleTypingChange}
        />
      </div>

      {/* Info panel */}
      <div
        className={cn(
          "flex-shrink-0 bg-white rounded-2xl overflow-hidden",
          "shadow-[6px_6px_12px_#d1d5db,-6px_-6px_12px_#ffffff]",
          "transition-all duration-300 ease-in-out",
          "hidden xl:block",
          showInfo ? "xl:w-[280px]" : "xl:w-0 xl:opacity-0"
        )}
      >
        {participant && (
          <ChatInfoPanel
            participant={participant}
            sharedFiles={MOCK_SHARED_FILES}
            onClose={() => setShowInfo(false)}
          />
        )}
      </div>
    </div>
  );
}
