"use client";

import { cn } from "@/lib/cn";
import type { ChatMessage } from "@/types/chat.types";

interface ReadReceiptProps {
  message: ChatMessage;
}

function getMessageStatus(message: ChatMessage): "sent" | "delivered" | "read" {
  if (message.status) return message.status;
  return message.isRead ? "read" : "sent";
}

function getHoverLabel(message: ChatMessage, status: "sent" | "delivered" | "read"): string {
  if (status === "read" && message.readAt) {
    return `Seen at ${message.readAt}`;
  }
  if (status === "delivered" && message.deliveredAt) {
    return `Delivered at ${message.deliveredAt}`;
  }
  return status === "sent" ? "Sent" : "Delivered";
}

export function ReadReceipt({ message }: ReadReceiptProps): React.JSX.Element {
  const status = getMessageStatus(message);
  const isRead = status === "read";
  const isDoubleCheck = status === "read" || status === "delivered";

  return (
    <span
      className={cn("inline-flex items-center", isRead ? "text-primary" : "text-text-secondary")}
      title={getHoverLabel(message, status)}
      aria-label={getHoverLabel(message, status)}
    >
      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
        {isDoubleCheck ? (
          <>
            <path strokeLinecap="round" strokeLinejoin="round" d="M1.5 13l4 4L11 11" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M8 13l4 4L22 7" />
          </>
        ) : (
          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
        )}
      </svg>
    </span>
  );
}
