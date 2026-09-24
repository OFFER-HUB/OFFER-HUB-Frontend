"use client";

import { useState, useRef, useCallback, useEffect, type FormEvent } from "react";
import { cn } from "@/lib/cn";
import { Icon, ICON_PATHS } from "@/components/ui/Icon";

const TYPING_STOP_DELAY_MS = 2_000;

interface MessageInputProps {
  onSendMessage: (content: string) => void;
  onTypingChange?: (isTyping: boolean) => void;
  disabled?: boolean;
}

export function MessageInput({
  onSendMessage,
  onTypingChange,
  disabled = false,
}: MessageInputProps) {
  const [message, setMessage] = useState("");
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const isTypingRef = useRef(false);
  const typingStopTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const emojiPickerRef = useRef<HTMLDivElement>(null);

  const POPULAR_EMOJIS = [
    "😀", "😂", "😍", "👍", "🎉", "🔥", "❤️", "🚀",
    "🤔", "👏", "🙌", "✨", "💯", "😎", "💡", "😢"
  ];

  // Close picker on clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (emojiPickerRef.current && !emojiPickerRef.current.contains(event.target as Node)) {
        setShowEmojiPicker(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const notifyTypingStop = useCallback(() => {
    if (isTypingRef.current) {
      isTypingRef.current = false;
      onTypingChange?.(false);
    }
  }, [onTypingChange]);

  const handleChange = useCallback(
    (value: string) => {
      setMessage(value);
      if (!onTypingChange) return;

      if (typingStopTimerRef.current !== null) {
        clearTimeout(typingStopTimerRef.current);
      }

      if (value.trim()) {
        if (!isTypingRef.current) {
          isTypingRef.current = true;
          onTypingChange(true);
        }
        typingStopTimerRef.current = setTimeout(notifyTypingStop, TYPING_STOP_DELAY_MS);
      } else {
        notifyTypingStop();
      }
    },
    [onTypingChange, notifyTypingStop]
  );

  const handleAddEmoji = (emoji: string) => {
    const newVal = message + emoji;
    handleChange(newVal);
  };

  function handleSubmit(e: FormEvent<HTMLFormElement>): void {
    e.preventDefault();
    const trimmedMessage = message.trim();
    if (!trimmedMessage || disabled) return;

    if (typingStopTimerRef.current !== null) {
      clearTimeout(typingStopTimerRef.current);
      typingStopTimerRef.current = null;
    }
    notifyTypingStop();
    onSendMessage(trimmedMessage);
    setMessage("");
    setShowEmojiPicker(false);
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
      {/* Message input container */}
      <div
        className={cn(
          "flex-1 flex items-center gap-2 sm:gap-3 px-3 sm:px-4 py-2.5 sm:py-3 rounded-xl relative",
          "bg-background",
          "shadow-[inset_2px_2px_4px_#d1d5db,inset_-2px_-2px_4px_#ffffff]"
        )}
      >
        {/* Emoji Selector button */}
        <div ref={emojiPickerRef} className="relative flex items-center">
          <button
            type="button"
            disabled={disabled}
            onClick={() => setShowEmojiPicker((prev) => !prev)}
            className={cn(
              "text-text-secondary hover:text-primary transition-colors p-1 rounded-lg cursor-pointer",
              showEmojiPicker && "text-primary",
              disabled && "cursor-not-allowed opacity-50"
            )}
            title="Add emoji"
          >
            <Icon path={ICON_PATHS.emoji} size="md" />
          </button>

          {/* Emoji Picker Popup */}
          {showEmojiPicker && (
            <div
              className={cn(
                "absolute bottom-full left-0 mb-3 p-3 rounded-2xl bg-white border border-border-light z-50 flex flex-wrap gap-2 w-64",
                "shadow-[6px_6px_12px_#d1d5db,-6px_-6px_12px_#ffffff]"
              )}
            >
              {POPULAR_EMOJIS.map((emoji) => (
                <button
                  key={emoji}
                  type="button"
                  onClick={() => handleAddEmoji(emoji)}
                  className="text-xl p-1.5 hover:bg-background rounded-lg cursor-pointer transition-all hover:scale-110 active:scale-95"
                >
                  {emoji}
                </button>
              ))}
            </div>
          )}
        </div>

        <input
          type="text"
          value={message}
          onChange={(e) => handleChange(e.target.value)}
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
