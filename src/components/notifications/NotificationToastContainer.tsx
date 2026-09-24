"use client";

import { useState, useCallback, useEffect } from "react";
import { useNotificationSSE } from "@/hooks/use-notification-sse";
import { useNotificationStore } from "@/stores/notification-store";
import { NotificationToast } from "./NotificationToast";
import type { Notification } from "@/types/notification.types";

interface ToastEntry {
  id: string;
  notification: Notification;
}

export function NotificationToastContainer(): React.JSX.Element {
  const [toasts, setToasts] = useState<ToastEntry[]>([]);

  const dismiss = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  // Show a toast whenever a new unread notification arrives at the front
  useEffect(() => {
    return useNotificationStore.subscribe((state, prevState) => {
      const latest = state.notifications[0];
      const previous = prevState.notifications[0];
      if (latest && latest !== previous && !latest.isRead) {
        setToasts((prev) => [
          { id: latest.id, notification: latest },
          ...prev.slice(0, 4),
        ]);
      }
    });
  }, []);

  // Mount the SSE connection
  useNotificationSSE();

  return (
    <div
      className="fixed top-4 right-4 z-[9999] flex flex-col gap-3 pointer-events-none"
      aria-label="Notifications"
    >
      {toasts.map((t) => (
        <div key={t.id} className="pointer-events-auto">
          <NotificationToast
            notification={t.notification}
            onDismiss={() => dismiss(t.id)}
          />
        </div>
      ))}
    </div>
  );
}
