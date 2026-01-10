"use client";

import { cn } from "@/lib/cn";
import { Icon, ICON_PATHS } from "@/components/ui/Icon";
import type { ChatUser } from "@/types/chat.types";

interface ChatHeaderProps {
  participant: ChatUser;
  onToggleSidebar?: () => void;
  onToggleInfo?: () => void;
  showInfoButton?: boolean;
}

export function ChatHeader({
  participant,
  onToggleSidebar,
  onToggleInfo,
  showInfoButton = true,
}: ChatHeaderProps) {
  return (
    <div
      className={cn(
        "flex items-center justify-between px-4 py-3",
        "border-b border-border-light",
        "bg-white"
      )}
    >
      <div className="flex items-center gap-3">
        {/* Mobile menu button */}
        {onToggleSidebar && (
          <button
            type="button"
            onClick={onToggleSidebar}
            className={cn(
              "lg:hidden p-2 rounded-lg",
              "text-text-secondary hover:text-text-primary",
              "hover:bg-background",
              "transition-all duration-200"
            )}
          >
            <Icon path={ICON_PATHS.menu} size="md" />
          </button>
        )}

        {/* Avatar */}
        <div className="relative">
          <div
            className={cn(
              "w-10 h-10 rounded-full flex items-center justify-center",
              "bg-gradient-to-br from-primary/20 to-secondary/20",
              "shadow-[2px_2px_4px_#d1d5db,-2px_-2px_4px_#ffffff]"
            )}
          >
            <span className="text-sm font-semibold text-text-primary">
              {participant.avatar}
            </span>
          </div>
          {participant.isOnline && (
            <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 border-2 border-white rounded-full" />
          )}
        </div>

        {/* Info */}
        <div>
          <h2 className="font-semibold text-text-primary">{participant.name}</h2>
          <p className="text-xs text-text-secondary">
            {participant.isOnline ? (
              <span className="text-green-600">Online</span>
            ) : (
              participant.title || "Offline"
            )}
          </p>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2">
        <button
          type="button"
          className={cn(
            "p-2 rounded-lg cursor-pointer",
            "text-text-secondary hover:text-text-primary",
            "hover:bg-background",
            "shadow-[2px_2px_4px_#d1d5db,-2px_-2px_4px_#ffffff]",
            "hover:shadow-[3px_3px_6px_#d1d5db,-3px_-3px_6px_#ffffff]",
            "transition-all duration-200"
          )}
          title="Video call"
        >
          <Icon path={ICON_PATHS.video} size="md" />
        </button>
        {showInfoButton && onToggleInfo && (
          <button
            type="button"
            onClick={onToggleInfo}
            className={cn(
              "p-2 rounded-lg cursor-pointer",
              "text-text-secondary hover:text-text-primary",
              "hover:bg-background",
              "shadow-[2px_2px_4px_#d1d5db,-2px_-2px_4px_#ffffff]",
              "hover:shadow-[3px_3px_6px_#d1d5db,-3px_-3px_6px_#ffffff]",
              "transition-all duration-200",
              "hidden sm:block"
            )}
            title="Chat info"
          >
            <Icon path={ICON_PATHS.user} size="md" />
          </button>
        )}
      </div>
    </div>
  );
}
