"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/cn";
import type { Notification } from "@/types/notification.types";

const DISMISS_DELAY_MS = 4_000;

interface Props {
  notification: Notification;
  onDismiss: () => void;
}

export function NotificationToast({ notification, onDismiss }: Props): React.JSX.Element {
  const [visible, setVisible] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    // Trigger enter animation
    const frame = requestAnimationFrame(() => setVisible(true));

    timerRef.current = setTimeout(() => {
      setVisible(false);
      setTimeout(onDismiss, 300);
    }, DISMISS_DELAY_MS);

    return () => {
      cancelAnimationFrame(frame);
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [onDismiss]);

  return (
    <div
      role="alert"
      aria-live="polite"
      className={cn(
        "flex items-start gap-3 w-80 p-4 rounded-2xl bg-white",
        "shadow-[6px_6px_12px_#d1d5db,-6px_-6px_12px_#ffffff]",
        "transition-all duration-300",
        visible ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-2",
      )}
    >
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-text-primary truncate">
          {notification.title}
        </p>
        <p className="text-xs text-text-secondary mt-0.5 line-clamp-2">
          {notification.message}
        </p>
      </div>
      <button
        type="button"
        onClick={() => {
          setVisible(false);
          setTimeout(onDismiss, 300);
        }}
        className="flex-shrink-0 text-text-secondary hover:text-text-primary transition-colors"
        aria-label="Dismiss notification"
      >
        <svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
          <path
            fillRule="evenodd"
            d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
            clipRule="evenodd"
          />
        </svg>
      </button>
    </div>
  );
}
