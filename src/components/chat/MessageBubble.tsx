"use client";

import { cn } from "@/lib/cn";
import type { ChatMessage } from "@/types/chat.types";

interface MessageBubbleProps {
  message: ChatMessage;
  isOwn: boolean;
}

export function MessageBubble({ message, isOwn }: MessageBubbleProps) {
  return (
    <div
      className={cn(
        "flex",
        isOwn ? "justify-end" : "justify-start"
      )}
    >
      <div
        className={cn(
          "max-w-[75%] sm:max-w-[65%] px-4 py-2.5 rounded-2xl",
          "transition-all duration-200",
          isOwn
            ? cn(
                "bg-primary text-white",
                "rounded-br-md",
                "shadow-[4px_4px_8px_#d1d5db,-2px_-2px_4px_#ffffff]"
              )
            : cn(
                "bg-white text-text-primary",
                "rounded-bl-md",
                "shadow-[4px_4px_8px_#d1d5db,-4px_-4px_8px_#ffffff]"
              )
        )}
      >
        <p className="text-sm leading-relaxed whitespace-pre-wrap break-words">
          {message.content}
        </p>
        <div
          className={cn(
            "flex items-center justify-end gap-1.5 mt-1",
            isOwn ? "text-white/70" : "text-text-secondary"
          )}
        >
          <span className="text-[10px]">{message.timestamp}</span>
          {isOwn && (
            <span className="text-[10px]">
              {message.isRead ? "✓✓" : "✓"}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
