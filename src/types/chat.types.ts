export interface ChatUser {
  id: string;
  name: string;
  avatar: string;
  isOnline: boolean;
  title?: string;
}

export interface ChatMessage {
  id: string;
  senderId: string;
  content: string;
  timestamp: string;
  isRead: boolean;
  status?: "sent" | "delivered" | "read";
  deliveredAt?: string;
  readAt?: string;
}

export interface Conversation {
  id: string;
  participant: ChatUser;
  lastMessage: string;
  lastMessageTime: string;
  unreadCount: number;
  isTyping?: boolean;
}

export interface ChatThread {
  id: string;
  participant: ChatUser;
  messages: ChatMessage[];
}

export interface SharedFile {
  id: string;
  name: string;
  type: "document" | "image" | "video" | "other";
  size: string;
  count?: number;
}

// ─── SSE ───────────────────────────────────────────────────────────────────

export type SSEConnectionStatus =
  | "connecting"
  | "connected"
  | "disconnected"
  | "error";

export type SSEEventType =
  | "new_message"
  | "message_edited"
  | "message_deleted"
  | "typing"
  | "messages_read";

export interface SSENewMessageEvent {
  type: "new_message";
  conversationId: string;
  message: ChatMessage;
}

export interface SSEMessageEditedEvent {
  type: "message_edited";
  conversationId: string;
  messageId: string;
  content: string;
  editedAt: string;
}

export interface SSEMessageDeletedEvent {
  type: "message_deleted";
  conversationId: string;
  messageId: string;
}

export interface SSETypingEvent {
  type: "typing";
  conversationId: string;
  userId: string;
  isTyping: boolean;
}

export interface SSEMessagesReadEvent {
  type: "messages_read";
  conversationId: string;
  userId: string;
  lastReadMessageId: string;
  readAt: string;
}

export type SSEChatEvent =
  | SSENewMessageEvent
  | SSEMessageEditedEvent
  | SSEMessageDeletedEvent
  | SSETypingEvent
  | SSEMessagesReadEvent;

// ─── API response shapes ────────────────────────────────────────────────────

export interface ConversationsResponse {
  conversations: Conversation[];
  hasMore: boolean;
  nextCursor?: string;
}

export interface MessagesResponse {
  messages: ChatMessage[];
  hasMore: boolean;
  nextCursor?: string;
}
