"use client";

import { useEffect, useRef, useCallback } from "react";
import { useAuthStore } from "@/stores/auth-store";
import { useNotificationStore } from "@/stores/notification-store";
import { API_URL } from "@/config/api";
import type { Notification } from "@/types/notification.types";

const MIN_BACKOFF_MS = 1_000;
const MAX_BACKOFF_MS = 30_000;
const BACKOFF_MULTIPLIER = 2;

function buildSSEUrl(token: string): string {
  return `${API_URL}/notifications/stream?token=${encodeURIComponent(token)}`;
}

export function useNotificationSSE(): void {
  const token = useAuthStore((s) => s.token);
  const { pushNotification, incrementUnread } = useNotificationStore();

  const esRef = useRef<EventSource | null>(null);
  const retryCountRef = useRef(0);
  const retryTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isMountedRef = useRef(true);
  const tokenRef = useRef(token);

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
    if (!isMountedRef.current || !tokenRef.current) return;

    closeConnection();

    const es = new EventSource(buildSSEUrl(tokenRef.current));
    esRef.current = es;

    es.addEventListener("new_notification", (e: MessageEvent) => {
      try {
        const notification: Notification = JSON.parse(e.data);
        pushNotification(notification);
        incrementUnread();
        retryCountRef.current = 0;
      } catch {
        // ignore malformed events
      }
    });

    es.addEventListener("notification_read", (e: MessageEvent) => {
      try {
        const { id } = JSON.parse(e.data) as { id: string };
        useNotificationStore.getState().markAsRead(id);
      } catch {
        // ignore malformed events
      }
    });

    es.onerror = () => {
      if (!isMountedRef.current) return;
      closeConnection();

      const backoff = Math.min(
        MIN_BACKOFF_MS * Math.pow(BACKOFF_MULTIPLIER, retryCountRef.current),
        MAX_BACKOFF_MS,
      );
      retryCountRef.current += 1;

      retryTimerRef.current = setTimeout(() => {
        if (isMountedRef.current) connect();
      }, backoff);
    };
  }, [closeConnection, pushNotification, incrementUnread]);

  useEffect(() => {
    isMountedRef.current = true;

    if (token) connect();

    const onVisible = () => {
      if (document.visibilityState === "visible" && tokenRef.current) connect();
    };
    document.addEventListener("visibilitychange", onVisible);

    return () => {
      isMountedRef.current = false;
      closeConnection();
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, [token, connect, closeConnection]);
}
