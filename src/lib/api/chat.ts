import { httpGet, httpPost, httpPatch } from "@/services/http-client";
import { API_URL } from "@/config/api";
import type { ApiResponse } from "@/types/api-response.types";
import type {
  ChatMessage,
  Conversation,
  ConversationsResponse,
  MessagesResponse,
} from "@/types/chat.types";

const BASE = "/chat/conversations";

/**
 * Fetch paginated conversations for the current user.
 */
export async function getConversations(
  cursor?: string
): Promise<ApiResponse<ConversationsResponse>> {
  return httpGet<ConversationsResponse>(BASE, {
    params: cursor ? { cursor, limit: "20" } : { limit: "20" },
  });
}

/**
 * Fetch paginated messages for a conversation.
 * Messages are returned in ascending order (oldest first).
 */
export async function getMessages(
  conversationId: string,
  cursor?: string
): Promise<ApiResponse<MessagesResponse>> {
  return httpGet<MessagesResponse>(`${BASE}/${conversationId}/messages`, {
    params: cursor ? { cursor, limit: "30" } : { limit: "30" },
  });
}

/**
 * Send a new message to a conversation.
 */
export async function sendMessage(
  conversationId: string,
  content: string
): Promise<ApiResponse<ChatMessage>> {
  return httpPost<ChatMessage>(`${BASE}/${conversationId}/messages`, {
    content,
  });
}

/**
 * Send typing status for a conversation.
 * Fire-and-forget — errors are silently swallowed so a failed typing
 * ping never blocks the user.
 */
export async function sendTypingStatus(
  conversationId: string,
  isTyping: boolean
): Promise<void> {
  try {
    await httpPost(`${BASE}/${conversationId}/typing`, { isTyping });
  } catch {
    // intentionally silent — typing status is best-effort
  }
}

/**
 * Mark all messages in a conversation as read.
 */
export async function markConversationRead(
  conversationId: string
): Promise<ApiResponse<null>> {
  return httpPatch<null>(`${BASE}/${conversationId}/read`);
}

/**
 * Build the SSE endpoint URL for a conversation.
 * The caller is responsible for appending the auth token as a query
 * parameter because EventSource does not support custom headers.
 */
export function getChatSSEUrl(conversationId: string, token: string): string {
  return `${API_URL}/chat/conversations/${conversationId}/events?token=${encodeURIComponent(token)}`;
}

/**
 * Fetch conversation detail (participant info etc.) by ID.
 */
export async function getConversation(
  conversationId: string
): Promise<ApiResponse<Conversation>> {
  return httpGet<Conversation>(`${BASE}/${conversationId}`);
}
