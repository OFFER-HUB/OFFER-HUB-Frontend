"use client";

import { useState, type FormEvent } from "react";
import { cn } from "@/lib/cn";
import { Icon, ICON_PATHS } from "@/components/ui/Icon";

interface MessageInputProps {
  onSendMessage: (content: string) => void;
  disabled?: boolean;
}

export function MessageInput({ onSendMessage, disabled = false }: MessageInputProps) {
  const [message, setMessage] = useState("");

  function handleSubmit(e: FormEvent<HTMLFormElement>): void {
    e.preventDefault();
    const trimmedMessage = message.trim();
    if (trimmedMessage && !disabled) {
      onSendMessage(trimmedMessage);
      setMessage("");
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className={cn(
        "flex items-center gap-2 sm:gap-3 px-4 sm:px-6 py-3 sm:py-4",
        "border-t border-border-light",
        "bg-white"
      )}
    >
      {/* Message input */}
      <div
        className={cn(
          "flex-1 flex items-center gap-2 sm:gap-3 px-3 sm:px-4 py-2.5 sm:py-3 rounded-xl",
          "bg-background",
          "shadow-[inset_2px_2px_4px_#d1d5db,inset_-2px_-2px_4px_#ffffff]"
        )}
      >
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Type your message..."
          disabled={disabled}
          className={cn(
            "flex-1 bg-transparent text-sm text-text-primary",
            "placeholder:text-text-secondary/60 outline-none",
            disabled && "cursor-not-allowed opacity-50"
          )}
        />
      </div>

      {/* Send button */}
      <button
        type="submit"
        disabled={!message.trim() || disabled}
        className={cn(
          "p-2.5 rounded-xl cursor-pointer",
          "transition-all duration-200",
          message.trim() && !disabled
            ? cn(
                "bg-primary text-white",
                "shadow-[4px_4px_8px_#d1d5db,-4px_-4px_8px_#ffffff]",
                "hover:shadow-[6px_6px_12px_#d1d5db,-6px_-6px_12px_#ffffff]",
                "active:shadow-[inset_2px_2px_4px_rgba(0,0,0,0.1)]"
              )
            : cn(
                "bg-background text-text-secondary",
                "shadow-[3px_3px_6px_#d1d5db,-3px_-3px_6px_#ffffff]",
                "cursor-not-allowed"
              )
        )}
        title="Send message"
      >
        <Icon path={ICON_PATHS.send} size="md" />
      </button>
    </form>
  );
}
