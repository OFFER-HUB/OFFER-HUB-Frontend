"use client";

import { cn } from "@/lib/cn";
import type { SSEConnectionStatus } from "@/types/chat.types";

interface ConnectionStatusProps {
  status: SSEConnectionStatus;
  className?: string;
}

const STATUS_CONFIG: Record<
  SSEConnectionStatus,
  { label: string; dotClass: string; textClass: string; visible: boolean }
> = {
  connecting: {
    label: "Connecting…",
    dotClass: "bg-yellow-400 animate-pulse",
    textClass: "text-yellow-600",
    visible: true,
  },
  connected: {
    label: "Connected",
    dotClass: "bg-green-500",
    textClass: "text-green-600",
    // Hide the "connected" badge — presence is implicit when chat is usable
    visible: false,
  },
  disconnected: {
    label: "Disconnected",
    dotClass: "bg-gray-400",
    textClass: "text-text-secondary",
    visible: true,
  },
  error: {
    label: "Reconnecting…",
    dotClass: "bg-red-400 animate-pulse",
    textClass: "text-red-500",
    visible: true,
  },
};

/**
 * Small inline badge that shows the SSE connection state.
 * Renders nothing when status is "connected" to avoid visual noise.
 */
export function ConnectionStatus({ status, className }: ConnectionStatusProps) {
  const config = STATUS_CONFIG[status];

  if (!config.visible) return null;

  return (
    <div
      className={cn(
        "flex items-center gap-1.5 px-2.5 py-1 rounded-full",
        "bg-background",
        "shadow-[inset_1px_1px_2px_#d1d5db,inset_-1px_-1px_2px_#ffffff]",
        className
      )}
      role="status"
      aria-live="polite"
      aria-label={`Chat connection status: ${config.label}`}
    >
      <span className={cn("w-2 h-2 rounded-full flex-shrink-0", config.dotClass)} />
      <span className={cn("text-[11px] font-medium", config.textClass)}>
        {config.label}
      </span>
    </div>
  );
}
