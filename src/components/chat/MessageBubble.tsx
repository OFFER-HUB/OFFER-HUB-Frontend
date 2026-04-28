"use client";

import { cn } from "@/lib/cn";
import type { ChatMessage } from "@/types/chat.types";
import { ReadReceipt } from "@/components/chat/ReadReceipt";
import { Icon, ICON_PATHS } from "@/components/ui/Icon";
import { useChatStore } from "@/stores/chat-store";
import { useParams } from "next/navigation";

interface MessageBubbleProps {
  message: ChatMessage;
  isOwn: boolean;
  showAvatar?: boolean;
  participantAvatar?: string;
}

export function MessageBubble({ message, isOwn, showAvatar = true, participantAvatar }: MessageBubbleProps) {
  const params = useParams();
  const chatId = params.id as string;
  const retryMessage = useChatStore((s) => s.retryMessage);

  const isSending = message.status === "sending";
  const isError = message.status === "error";

  return (
    <div
      className={cn(
        "flex gap-3 group",
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
          "max-w-[70%] sm:max-w-[60%] flex flex-col",
          isOwn ? "items-end" : "items-start"
        )}
      >
        <div
          className={cn(
            "px-4 py-3 rounded-2xl relative",
            isOwn
              ? cn(
                  "bg-primary text-white",
                  "rounded-br-md",
                  "shadow-[4px_4px_8px_#d1d5db,-2px_-2px_4px_#ffffff]",
                  isSending && "opacity-70",
                  isError && "bg-error/80"
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

          {isError && (
            <button
              onClick={() => retryMessage(chatId, message.id)}
              className="absolute -left-10 top-1/2 -translate-y-1/2 p-2 rounded-full bg-white shadow-md text-error hover:scale-110 transition-transform cursor-pointer"
              title="Retry sending"
            >
              <Icon path={ICON_PATHS.refresh} size="sm" />
            </button>
          )}
        </div>

        <div
          className={cn(
            "flex items-center gap-1.5 mt-1.5 px-1",
            isOwn ? "justify-end" : "justify-start"
          )}
        >
          {isSending ? (
            <span className="text-[10px] text-text-secondary animate-pulse">Sending…</span>
          ) : isError ? (
            <span className="text-[10px] text-error font-medium">Failed to send</span>
          ) : (
            <>
              <span className="text-[10px] text-text-secondary">
                {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
              {isOwn && <ReadReceipt message={message} />}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
