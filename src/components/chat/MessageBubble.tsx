"use client";

import { cn } from "@/lib/cn";
import type { ChatMessage } from "@/types/chat.types";
import { ReadReceipt } from "@/components/chat/ReadReceipt";

interface MessageBubbleProps {
  message: ChatMessage;
  isOwn: boolean;
  showAvatar?: boolean;
  participantAvatar?: string;
  onRetry?: (messageId: string, content: string) => void;
}

export function MessageBubble({
  message,
  isOwn,
  showAvatar = true,
  participantAvatar,
  onRetry,
}: MessageBubbleProps) {
  const isSending = message.status === "sending";
  const isError = message.status === "error";

  return (
    <div
      className={cn(
        "flex gap-3",
        isOwn ? "justify-end" : "justify-start"
      )}
    >
      {/* Other user avatar */}
      {!isOwn && showAvatar && (
        <div
          className={cn(
            "flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center self-end",
            "bg-gradient-to-br from-primary/20 to-accent/20",
            "shadow-[2px_2px_4px_#d1d5db,-2px_-2px_4px_#ffffff]"
          )}
        >
          <span className="text-[10px] font-bold text-text-primary">
            {participantAvatar || "?"}
          </span>
        </div>
      )}

      {!isOwn && !showAvatar && <div className="w-8" />}

      <div
        className={cn(
          "max-w-[70%] sm:max-w-[60%]",
          isOwn ? "order-1" : "order-2"
        )}
      >
        <div
          className={cn(
            "px-4 py-3 rounded-2xl relative",
            isOwn
              ? cn(
                  isSending
                    ? "bg-primary/75 text-white/90 animate-pulse-soft"
                    : isError
                    ? "bg-error/10 border border-error/20 text-error"
                    : "bg-primary text-white",
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

          {isOwn && isSending && (
            <div className="absolute right-2 bottom-1 flex items-center gap-0.5 opacity-80 scale-75 origin-bottom-right">
              <span className="w-1.5 h-1.5 rounded-full bg-white animate-bounce" style={{ animationDelay: "-0.3s" }}></span>
              <span className="w-1.5 h-1.5 rounded-full bg-white animate-bounce" style={{ animationDelay: "-0.15s" }}></span>
              <span className="w-1.5 h-1.5 rounded-full bg-white animate-bounce"></span>
            </div>
          )}
        </div>
        <div
          className={cn(
            "flex items-center gap-1.5 mt-1.5 px-1",
            isOwn ? "justify-end" : "justify-start"
          )}
        >
          {isError ? (
            <div className="flex items-center gap-2 text-error text-[10px] font-semibold">
              <span>Failed to send</span>
              {onRetry && (
                <button
                  type="button"
                  onClick={() => onRetry(message.id, message.content)}
                  className="underline cursor-pointer hover:text-error-hover transition-colors"
                >
                  Retry
                </button>
              )}
            </div>
          ) : (
            <>
              <span className="text-[10px] text-text-secondary">{message.timestamp}</span>
              {isOwn && !isSending && <ReadReceipt message={message} />}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
