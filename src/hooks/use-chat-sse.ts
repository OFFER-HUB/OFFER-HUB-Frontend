"use client";

import { useEffect, useRef, useCallback } from "react";
import { useAuthStore } from "@/stores/auth-store";
import { useChatStore } from "@/stores/chat-store";
import { getChatSSEUrl } from "@/lib/api/chat";
import type { SSEChatEvent } from "@/types/chat.types";

const MIN_BACKOFF_MS = 1_000;
const MAX_BACKOFF_MS = 30_000;
const BACKOFF_MULTIPLIER = 2;

interface UseChatSSEOptions {
  /** The conversation to subscribe to. Pass null/undefined to disconnect. */
  conversationId: string | null | undefined;
}

/**
 * Opens an SSE connection to the chat events endpoint for the given
 * conversation.  Handles:
 *   - Exponential backoff reconnection on disconnect / error
 *   - Tab visibility changes (reconnect when the tab becomes visible)
 *   - Clean teardown on unmount or conversationId change
 *   - Zustand store updates for every event type
 */
export function useChatSSE({ conversationId }: UseChatSSEOptions): void {
  const token = useAuthStore((s) => s.token);
  const currentUserId = useAuthStore((s) => s.user?.id);

  const {
    appendMessage,
    editMessage,
    deleteMessage,
    setTyping,
    setConnectionStatus,
    updateConversationLastMessage,
    incrementUnread,
  } = useChatStore();

  // Stable refs so the connect function doesn't capture stale closures
  const esRef = useRef<EventSource | null>(null);
  const retryCountRef = useRef(0);
  const retryTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isMountedRef = useRef(true);
  const conversationIdRef = useRef(conversationId);
  const tokenRef = useRef(token);

  conversationIdRef.current = conversationId;
  tokenRef.current = token;

  const clearRetryTimer = useCallback(() => {
    if (retryTimerRef.current !== null) {
      clearTimeout(retryTimerRef.current);
      retryTimerRef.current = null;
    }
  }, []);

  const closeConnection = useCallback(() => {
    if (esRef.current) {
      esRef.current.close();
      esRef.current = null;
    }
    clearRetryTimer();
  }, [clearRetryTimer]);

  const connect = useCallback(() => {
    const cid = conversationIdRef.current;
    const tok = tokenRef.current;

    if (!cid || !tok || !isMountedRef.current) return;

    // Don't open a second connection if one is already open/connecting
    if (esRef.current && esRef.current.readyState !== EventSource.CLOSED) {
      return;
    }

    setConnectionStatus(cid, "connecting");

    const url = getChatSSEUrl(cid, tok);
    const es = new EventSource(url);
    esRef.current = es;

    es.onopen = () => {
      if (!isMountedRef.current) return;
      retryCountRef.current = 0;
      setConnectionStatus(cid, "connected");
    };

    es.onmessage = (event: MessageEvent) => {
      if (!isMountedRef.current) return;
      try {
        const data = JSON.parse(event.data as string) as SSEChatEvent;
        handleEvent(cid, data);
      } catch {
        // Malformed event — skip silently
      }
    };

    // Named event listeners for typed events the server may emit
    es.addEventListener("new_message", (event: MessageEvent) => {
      if (!isMountedRef.current) return;
      try {
        const data = JSON.parse(event.data as string) as SSEChatEvent;
        handleEvent(cid, data);
      } catch {
        // skip
      }
    });

    es.addEventListener("message_edited", (event: MessageEvent) => {
      if (!isMountedRef.current) return;
      try {
        const data = JSON.parse(event.data as string) as SSEChatEvent;
        handleEvent(cid, data);
      } catch {
        // skip
      }
    });

    es.addEventListener("message_deleted", (event: MessageEvent) => {
      if (!isMountedRef.current) return;
      try {
        const data = JSON.parse(event.data as string) as SSEChatEvent;
        handleEvent(cid, data);
      } catch {
        // skip
      }
    });

    es.addEventListener("typing", (event: MessageEvent) => {
      if (!isMountedRef.current) return;
      try {
        const data = JSON.parse(event.data as string) as SSEChatEvent;
        handleEvent(cid, data);
      } catch {
        // skip
      }
    });

    es.onerror = () => {
      if (!isMountedRef.current) return;

      es.close();
      esRef.current = null;

      const isStillRelevant = conversationIdRef.current === cid;
      if (!isStillRelevant) return;

      setConnectionStatus(cid, "error");

      // Exponential backoff
      const backoff = Math.min(
        MIN_BACKOFF_MS * Math.pow(BACKOFF_MULTIPLIER, retryCountRef.current),
        MAX_BACKOFF_MS
      );
      retryCountRef.current += 1;

      retryTimerRef.current = setTimeout(() => {
        if (isMountedRef.current && conversationIdRef.current === cid) {
          setConnectionStatus(cid, "connecting");
          connect();
        }
      }, backoff);
    };

    // Local helper — defined inside connect so it closes over store actions
    function handleEvent(conversationId: string, event: SSEChatEvent): void {
      switch (event.type) {
        case "new_message": {
          appendMessage(conversationId, event.message);
          updateConversationLastMessage(conversationId, event.message);
          // Increment unread only for messages from other users
          if (event.message.senderId !== currentUserId) {
            incrementUnread(conversationId);
          }
          break;
        }
        case "message_edited": {
          editMessage(conversationId, event.messageId, event.content);
          break;
        }
        case "message_deleted": {
          deleteMessage(conversationId, event.messageId);
          break;
        }
        case "typing": {
          setTyping(conversationId, event.userId, event.isTyping);
          break;
        }
      }
    }
  }, [
    appendMessage,
    editMessage,
    deleteMessage,
    setTyping,
    setConnectionStatus,
    updateConversationLastMessage,
    incrementUnread,
    currentUserId,
  ]);

  // ── Main effect: open / close connection when conversationId or token changes
  useEffect(() => {
    isMountedRef.current = true;

    if (!conversationId || !token) {
      closeConnection();
      return;
    }

    connect();

    return () => {
      isMountedRef.current = false;
      closeConnection();
      if (conversationId) {
        setConnectionStatus(conversationId, "disconnected");
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [conversationId, token]);

  // ── Visibility effect: reconnect when the tab becomes visible again
  useEffect(() => {
    function handleVisibilityChange(): void {
      if (document.visibilityState !== "visible") return;
      const cid = conversationIdRef.current;
      if (!cid || !tokenRef.current || !isMountedRef.current) return;

      const es = esRef.current;
      const isDisconnected =
        es === null || es.readyState === EventSource.CLOSED;

      if (isDisconnected) {
        clearRetryTimer();
        retryCountRef.current = 0;
        connect();
      }
    }

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [connect, clearRetryTimer]);
}
