"use client";

import { cn } from "@/lib/cn";

interface TypingIndicatorProps {
  name?: string;
  className?: string;
}

/**
 * Animated "someone is typing" indicator with three bouncing dots.
 * Matches the neumorphic card style used throughout the chat UI.
 */
export function TypingIndicator({ name, className }: TypingIndicatorProps) {
  return (
    <div className={cn("flex items-end gap-2", className)}>
      {/* Avatar spacer to align with incoming message bubbles */}
      <div
        className={cn(
          "w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center",
          "bg-gradient-to-br from-primary/20 to-accent/20",
          "shadow-[2px_2px_4px_#d1d5db,-2px_-2px_4px_#ffffff]"
        )}
      >
        <span className="text-[10px] font-semibold text-text-secondary">
          {name ? name.charAt(0).toUpperCase() : "?"}
        </span>
      </div>

      {/* Bubble */}
      <div
        className={cn(
          "flex items-center gap-1 px-4 py-3 rounded-2xl rounded-bl-sm",
          "bg-white",
          "shadow-[4px_4px_8px_#d1d5db,-4px_-4px_8px_#ffffff]"
        )}
        aria-label={name ? `${name} is typing` : "Someone is typing"}
        role="status"
      >
        <span
          className="w-2 h-2 rounded-full bg-primary/60 animate-bounce"
          style={{ animationDelay: "0ms", animationDuration: "1s" }}
        />
        <span
          className="w-2 h-2 rounded-full bg-primary/60 animate-bounce"
          style={{ animationDelay: "200ms", animationDuration: "1s" }}
        />
        <span
          className="w-2 h-2 rounded-full bg-primary/60 animate-bounce"
          style={{ animationDelay: "400ms", animationDuration: "1s" }}
        />
      </div>
    </div>
  );
}
