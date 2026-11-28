import { httpGet, httpPost } from "@/services/http-client";
import { API_URL } from "@/config/api";
import { useAuthStore } from "@/stores/auth-store";
import {
  mapConversationsList,
  mapMessage,
  mapMessagesPage,
} from "@/lib/chat-mappers";
import type { ApiResponse } from "@/types/api-response.types";
import type {
  ApiConversation,
  ApiMessage,
  ApiMessagesPage,
  ChatMessage,
  ConversationsResponse,
  CreateConversationPayload,
  MessagesResponse,
} from "@/types/chat.types";

/**
 * Relative to the API base: the http client prepends `API_URL` itself, so an
 * absolute URL here would end up as `…/api/v1/http://…/api/v1/conversations`.
 */
const BASE = "/conversations";

/**
 * The server answers `{ data }` on success and `{ error }` on failure, with no `ok` flag,
 * while the chat store checks `res.ok`. This turns one into the other and maps the
 * payload to the shapes the screens use.
 */
function adapt<Raw, Out>(res: ApiResponse<Raw>, map: (raw: Raw) => Out): ApiResponse<Out> {
  const failed = res.ok === false || "error" in (res as object) || res.data == null;
  if (failed) {
    return { ...res, ok: false, data: null } as ApiResponse<Out>;
  }
  return { ...res, ok: true, data: map(res.data as Raw) } as ApiResponse<Out>;
}

/**
 * Fetch the user's conversations. The server returns all of them at once.
 */
export async function getConversations(
  // Kept for the store's "load more"; the endpoint has no pages.
  _cursor?: string
): Promise<ApiResponse<ConversationsResponse>> {
  const res = await httpGet<ApiConversation[]>(BASE);
  const me = useAuthStore.getState().user?.id;
  return adapt(res, (list) => mapConversationsList(list, me));
}

/**
 * Create a new conversation with another user.
 * Returns the newly created conversation, or an existing one if it already
 * exists between the two participants (backend deduplication).
 */
export async function createConversation(
  payload: CreateConversationPayload
): Promise<ApiResponse<{ id: string }>> {
  const res = await httpPost<{ id: string }>(BASE, payload);
  return adapt(res, (conversation) => ({ id: conversation.id }));
}

/**
 * Fetch a page of messages for a conversation, oldest first.
 */
export async function getMessages(
  conversationId: string,
  cursor?: string
): Promise<ApiResponse<MessagesResponse>> {
  const res = await httpGet<ApiMessagesPage>(`${BASE}/${conversationId}/messages`, {
    params: cursor ? { cursor, limit: "30" } : { limit: "30" },
  });
  return adapt(res, mapMessagesPage);
}

/**
 * Send a new message to a conversation.
 */
export async function sendMessage(
  conversationId: string,
  content: string
): Promise<ApiResponse<ChatMessage>> {
  const res = await httpPost<ApiMessage>(`${BASE}/${conversationId}/messages`, { content });
  return adapt(res, mapMessage);
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
 * Mark messages as read, up to an optional message id (all of them otherwise).
 */
export async function markMessagesAsRead(
  conversationId: string,
  lastReadMessageId?: string
): Promise<ApiResponse<null>> {
  return httpPost<null>(
    `${BASE}/${conversationId}/read`,
    lastReadMessageId ? { messageId: lastReadMessageId } : undefined
  );
}

/**
 * Build the SSE endpoint URL for a conversation.
 * The caller is responsible for appending the auth token as a query
 * parameter because EventSource does not support custom headers.
 */
export function getChatSSEUrl(conversationId: string, token: string): string {
  return `${API_URL}/conversations/${conversationId}/stream?token=${encodeURIComponent(token)}`;
}
