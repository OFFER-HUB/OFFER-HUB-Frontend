import { create } from "zustand";
import type { Conversation, ChatMessage, SSEConnectionStatus } from "@/types/chat.types";
import {
  getConversations,
  getMessages,
  sendMessage as apiSendMessage,
  markMessagesAsRead,
} from "@/lib/api/chat";

const READ_BATCH_DEBOUNCE_MS = 350;

const readBatchTimers: Record<string, ReturnType<typeof setTimeout> | undefined> = {};
const readBatchLastMessageId: Record<string, string | undefined> = {};

interface ChatState {
  // Conversations
  conversations: Conversation[];
  conversationsLoading: boolean;
  conversationsHasMore: boolean;
  conversationsCursor: string | undefined;

  // Messages keyed by conversationId
  messagesByConversation: Record<string, ChatMessage[]>;
  messagesLoading: Record<string, boolean>;
  messagesHasMore: Record<string, boolean>;
  messagesCursor: Record<string, string | undefined>;

  // Typing state: conversationId -> Set of userIds currently typing
  typingUsers: Record<string, Set<string>>;

  // SSE connection status per conversationId
  connectionStatus: Record<string, SSEConnectionStatus>;

  // Actions
  fetchConversations: () => Promise<void>;
  fetchMoreConversations: () => Promise<void>;
  fetchMessages: (conversationId: string) => Promise<void>;
  fetchMoreMessages: (conversationId: string) => Promise<void>;
  sendMessage: (conversationId: string, content: string) => Promise<void>;
  markAsRead: (conversationId: string, lastReadMessageId?: string) => Promise<void>;
  queueMarkAsRead: (conversationId: string, lastReadMessageId?: string) => void;

  // Real-time mutations (called by useChatSSE)
  appendMessage: (conversationId: string, message: ChatMessage) => void;
  editMessage: (conversationId: string, messageId: string, content: string) => void;
  deleteMessage: (conversationId: string, messageId: string) => void;
  setTyping: (conversationId: string, userId: string, isTyping: boolean) => void;
  setConnectionStatus: (conversationId: string, status: SSEConnectionStatus) => void;
  updateConversationLastMessage: (conversationId: string, message: ChatMessage) => void;
  incrementUnread: (conversationId: string) => void;
  clearUnread: (conversationId: string) => void;
  applyReadReceipt: (
    conversationId: string,
    lastReadMessageId: string,
    readAt: string,
    readerUserId?: string
  ) => void;
}

export const useChatStore = create<ChatState>()((set, get) => ({
  conversations: [],
  conversationsLoading: false,
  conversationsHasMore: false,
  conversationsCursor: undefined,

  messagesByConversation: {},
  messagesLoading: {},
  messagesHasMore: {},
  messagesCursor: {},

  typingUsers: {},
  connectionStatus: {},

  // ─── Conversations ───────────────────────────────────────────────────────

  fetchConversations: async () => {
    set({ conversationsLoading: true });
    const res = await getConversations();
    if (res.ok && res.data) {
      set({
        conversations: res.data.conversations,
        conversationsHasMore: res.data.hasMore,
        conversationsCursor: res.data.nextCursor,
      });
    }
    set({ conversationsLoading: false });
  },

  fetchMoreConversations: async () => {
    const { conversationsLoading, conversationsHasMore, conversationsCursor, conversations } = get();
    if (conversationsLoading || !conversationsHasMore) return;

    set({ conversationsLoading: true });
    const res = await getConversations(conversationsCursor);
    if (res.ok && res.data) {
      set({
        conversations: [...conversations, ...res.data.conversations],
        conversationsHasMore: res.data.hasMore,
        conversationsCursor: res.data.nextCursor,
      });
    }
    set({ conversationsLoading: false });
  },

  // ─── Messages ────────────────────────────────────────────────────────────

  fetchMessages: async (conversationId: string) => {
    set((state) => ({
      messagesLoading: { ...state.messagesLoading, [conversationId]: true },
    }));

    const res = await getMessages(conversationId);
    if (res.ok && res.data) {
      set((state) => ({
        messagesByConversation: {
          ...state.messagesByConversation,
          [conversationId]: res.data!.messages,
        },
        messagesHasMore: {
          ...state.messagesHasMore,
          [conversationId]: res.data!.hasMore,
        },
        messagesCursor: {
          ...state.messagesCursor,
          [conversationId]: res.data!.nextCursor,
        },
      }));
    }

    set((state) => ({
      messagesLoading: { ...state.messagesLoading, [conversationId]: false },
    }));
  },

  fetchMoreMessages: async (conversationId: string) => {
    const { messagesLoading, messagesHasMore, messagesCursor, messagesByConversation } = get();
    if (messagesLoading[conversationId] || !messagesHasMore[conversationId]) return;

    set((state) => ({
      messagesLoading: { ...state.messagesLoading, [conversationId]: true },
    }));

    const cursor = messagesCursor[conversationId];
    const res = await getMessages(conversationId, cursor);
    if (res.ok && res.data) {
      const existing = messagesByConversation[conversationId] ?? [];
      set((state) => ({
        messagesByConversation: {
          ...state.messagesByConversation,
          // Prepend older messages at the top
          [conversationId]: [...res.data!.messages, ...existing],
        },
        messagesHasMore: {
          ...state.messagesHasMore,
          [conversationId]: res.data!.hasMore,
        },
        messagesCursor: {
          ...state.messagesCursor,
          [conversationId]: res.data!.nextCursor,
        },
      }));
    }

    set((state) => ({
      messagesLoading: { ...state.messagesLoading, [conversationId]: false },
    }));
  },

  sendMessage: async (conversationId: string, content: string) => {
    const res = await apiSendMessage(conversationId, content);
    if (res.ok && res.data) {
      get().appendMessage(conversationId, res.data);
      get().updateConversationLastMessage(conversationId, res.data);
    }
  },

  markAsRead: async (conversationId: string, lastReadMessageId?: string) => {
    get().clearUnread(conversationId);
    await markMessagesAsRead(conversationId, lastReadMessageId);
  },

  queueMarkAsRead: (conversationId: string, lastReadMessageId?: string) => {
    get().clearUnread(conversationId);

    const currentQueuedId = readBatchLastMessageId[conversationId];
    const messages = get().messagesByConversation[conversationId] ?? [];
    const currentIndex = currentQueuedId
      ? messages.findIndex((m) => m.id === currentQueuedId)
      : -1;
    const nextIndex = lastReadMessageId
      ? messages.findIndex((m) => m.id === lastReadMessageId)
      : -1;

    // Keep the furthest visible message in a batch window.
    if (!currentQueuedId || nextIndex >= currentIndex) {
      readBatchLastMessageId[conversationId] = lastReadMessageId;
    }

    if (readBatchTimers[conversationId]) {
      clearTimeout(readBatchTimers[conversationId]);
    }

    readBatchTimers[conversationId] = setTimeout(() => {
      const queuedId = readBatchLastMessageId[conversationId];
      delete readBatchLastMessageId[conversationId];
      delete readBatchTimers[conversationId];
      void get().markAsRead(conversationId, queuedId);
    }, READ_BATCH_DEBOUNCE_MS);
  },

  // ─── Real-time mutations ──────────────────────────────────────────────────

  appendMessage: (conversationId, message) => {
    set((state) => {
      const existing = state.messagesByConversation[conversationId] ?? [];
      const existingIndex = existing.findIndex((m) => m.id === message.id);
      // Merge duplicate deliveries so status/read fields can still update in real-time.
      if (existingIndex >= 0) {
        const merged = [...existing];
        merged[existingIndex] = { ...merged[existingIndex], ...message };
        return {
          messagesByConversation: {
            ...state.messagesByConversation,
            [conversationId]: merged,
          },
        };
      }
      return {
        messagesByConversation: {
          ...state.messagesByConversation,
          [conversationId]: [...existing, message],
        },
      };
    });
  },

  editMessage: (conversationId, messageId, content) => {
    set((state) => {
      const existing = state.messagesByConversation[conversationId] ?? [];
      return {
        messagesByConversation: {
          ...state.messagesByConversation,
          [conversationId]: existing.map((m) =>
            m.id === messageId ? { ...m, content } : m
          ),
        },
      };
    });
  },

  deleteMessage: (conversationId, messageId) => {
    set((state) => {
      const existing = state.messagesByConversation[conversationId] ?? [];
      return {
        messagesByConversation: {
          ...state.messagesByConversation,
          [conversationId]: existing.filter((m) => m.id !== messageId),
        },
      };
    });
  },

  setTyping: (conversationId, userId, isTyping) => {
    set((state) => {
      const current = new Set(state.typingUsers[conversationId] ?? []);
      if (isTyping) {
        current.add(userId);
      } else {
        current.delete(userId);
      }

      const updatedConversations = state.conversations.map((c) =>
        c.id === conversationId ? { ...c, isTyping: current.size > 0 } : c
      );

      return {
        typingUsers: { ...state.typingUsers, [conversationId]: current },
        conversations: updatedConversations,
      };
    });
  },

  setConnectionStatus: (conversationId, status) => {
    set((state) => ({
      connectionStatus: { ...state.connectionStatus, [conversationId]: status },
    }));
  },

  updateConversationLastMessage: (conversationId, message) => {
    set((state) => ({
      conversations: state.conversations.map((c) =>
        c.id === conversationId
          ? {
              ...c,
              lastMessage: message.content,
              lastMessageTime: message.timestamp,
            }
          : c
      ),
    }));
  },

  incrementUnread: (conversationId) => {
    set((state) => ({
      conversations: state.conversations.map((c) =>
        c.id === conversationId
          ? { ...c, unreadCount: c.unreadCount + 1 }
          : c
      ),
    }));
  },

  clearUnread: (conversationId) => {
    set((state) => ({
      conversations: state.conversations.map((c) =>
        c.id === conversationId ? { ...c, unreadCount: 0 } : c
      ),
    }));
  },

  applyReadReceipt: (conversationId, lastReadMessageId, readAt, readerUserId) => {
    set((state) => {
      const existing = state.messagesByConversation[conversationId] ?? [];
      const lastReadIndex = existing.findIndex((m) => m.id === lastReadMessageId);
      if (lastReadIndex < 0) return state;

      const updatedMessages = existing.map((message, index) => {
        if (index > lastReadIndex) return message;
        if (readerUserId && message.senderId === readerUserId) return message;

        return {
          ...message,
          isRead: true,
          status: "read" as const,
          readAt,
        };
      });

      return {
        messagesByConversation: {
          ...state.messagesByConversation,
          [conversationId]: updatedMessages,
        },
      };
    });
  },
}));
