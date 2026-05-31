"use client";

import { cn } from "@/lib/cn";
import type { ChatMessage } from "@/types/chat.types";
import { ReadReceipt } from "@/components/chat/ReadReceipt";
import { MessageAttachment } from "@/components/chat/MessageAttachment";

interface MessageBubbleProps {
  message: ChatMessage;
  isOwn: boolean;
  showAvatar?: boolean;
  participantAvatar?: string;
}

export function MessageBubble({ message, isOwn, showAvatar = true, participantAvatar }: MessageBubbleProps) {
  const hasContent = message.content.trim().length > 0;
  const hasAttachments = message.attachments && message.attachments.length > 0;

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
        {/* Message content */}
        {(hasContent || hasAttachments) && (
          <div
            className={cn(
              "px-4 py-3 rounded-2xl",
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
            {/* Text content */}
            {hasContent && (
              <p className="text-sm leading-relaxed whitespace-pre-wrap break-words">
                {message.content}
              </p>
            )}

            {/* Attachments */}
            {hasAttachments && (
              <div className={cn(
                "flex flex-col gap-2",
                hasContent && "mt-3"
              )}>
                {message.attachments.map((attachment) => (
                  <MessageAttachment
                    key={attachment.id}
                    attachment={attachment}
                    isOwn={isOwn}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {/* Timestamp and read receipt */}
        <div
          className={cn(
            "flex items-center gap-1.5 mt-1.5 px-1",
            isOwn ? "justify-end" : "justify-start"
          )}
        >
          <span className="text-[10px] text-text-secondary">{message.timestamp}</span>
          {isOwn && <ReadReceipt message={message} />}
        </div>
      </div>
    </div>
  );
}
