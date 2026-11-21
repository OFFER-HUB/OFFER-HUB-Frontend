import type {
  ApiChatUser,
  ApiConversation,
  ApiMessage,
  ApiMessagesPage,
  ChatMessage,
  ChatUser,
  Conversation,
  ConversationsResponse,
  MessagesResponse,
} from "@/types/chat.types";

/**
 * The server stores message text HTML-escaped. React escapes again when it renders,
 * so "it's" would show as "it&#x27;s" unless it is decoded here.
 */
export function unescapeMessageText(text: string): string {
  return text
    .replace(/&#x27;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&amp;/g, "&");
}

export function chatDisplayName(user: ApiChatUser): string {
  const full = `${user.firstName ?? ""} ${user.lastName ?? ""}`.trim();
  return full || user.username || user.professionalTitle || "User";
}

export function mapChatUser(user: ApiChatUser): ChatUser {
  const name = chatDisplayName(user);
  return {
    id: user.id,
    name,
    avatar: user.avatarUrl || name.charAt(0).toUpperCase(),
    isOnline: false,
    title: user.professionalTitle ?? undefined,
  };
}

/** "14:05" for today, "Nov 18" for anything older. */
export function formatChatTime(iso: string, now: Date = new Date()): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";
  if (date.toDateString() === now.toDateString()) {
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  }
  return date.toLocaleDateString([], { month: "short", day: "numeric" });
}

export function mapMessage(message: ApiMessage): ChatMessage {
  return {
    id: message.id,
    senderId: message.sender.id,
    content: unescapeMessageText(message.content),
    timestamp: formatChatTime(message.createdAt),
    isRead: message.readAt !== null,
    status: message.readAt ? "read" : "sent",
    readAt: message.readAt ?? undefined,
  };
}

/** The server pages newest first; the screen reads oldest first. */
export function mapMessagesPage(page: ApiMessagesPage): MessagesResponse {
  return {
    messages: [...page.items].reverse().map(mapMessage),
    hasMore: page.hasMore,
    nextCursor: page.nextCursor ?? undefined,
  };
}

export function mapConversation(conversation: ApiConversation, currentUserId: string | undefined): Conversation {
  const other =
    conversation.participants.find((p) => p.userId !== currentUserId) ?? conversation.participants[0];
  const activityAt = conversation.lastMessageAt ?? conversation.createdAt;
  return {
    id: conversation.id,
    participant: other ? mapChatUser(other.user) : { id: "", name: "User", avatar: "U", isOnline: false },
    lastMessage: conversation.lastMessagePreview ? unescapeMessageText(conversation.lastMessagePreview) : "",
    lastMessageTime: formatChatTime(activityAt),
    lastMessageAt: activityAt,
    unreadCount: conversation.unreadCount,
  };
}

/** The list endpoint is not paged: it returns every conversation as a plain array. */
export function mapConversationsList(
  conversations: ApiConversation[],
  currentUserId: string | undefined,
): ConversationsResponse {
  return {
    conversations: conversations.map((c) => mapConversation(c, currentUserId)),
    hasMore: false,
  };
}
