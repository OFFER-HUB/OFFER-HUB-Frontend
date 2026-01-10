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
        "flex items-center justify-between px-4 sm:px-6 py-4",
        "border-b border-border-light",
        "bg-white"
      )}
    >
      <div className="flex items-center gap-3 sm:gap-4">
        {/* Mobile menu button */}
        {onToggleSidebar && (
          <button
            type="button"
            onClick={onToggleSidebar}
            className={cn(
              "lg:hidden p-2 rounded-lg cursor-pointer",
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
              "w-10 h-10 sm:w-11 sm:h-11 rounded-full flex items-center justify-center",
              "bg-gradient-to-br from-primary/20 to-accent/20",
              "shadow-[3px_3px_6px_#d1d5db,-3px_-3px_6px_#ffffff]"
            )}
          >
            <span className="text-sm font-semibold text-text-primary">
              {participant.avatar}
            </span>
          </div>
          {participant.isOnline && (
            <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full" />
          )}
        </div>

        {/* Info */}
        <div>
          <h2 className="font-semibold text-text-primary text-sm sm:text-base">{participant.name}</h2>
          <p className="text-xs text-text-secondary">
            {participant.isOnline ? (
              <span className="text-green-600 flex items-center gap-1">
                <span className="w-1.5 h-1.5 bg-green-500 rounded-full" />
                Online
              </span>
            ) : (
              participant.title || "Offline"
            )}
          </p>
        </div>
      </div>

      {/* Actions */}
      {showInfoButton && onToggleInfo && (
        <button
          type="button"
          onClick={onToggleInfo}
          className={cn(
            "p-2.5 rounded-xl cursor-pointer",
            "text-text-secondary hover:text-primary",
            "bg-background",
            "shadow-[3px_3px_6px_#d1d5db,-3px_-3px_6px_#ffffff]",
            "hover:shadow-[4px_4px_8px_#d1d5db,-4px_-4px_8px_#ffffff]",
            "transition-all duration-200",
            "hidden sm:flex"
          )}
          title="View profile"
        >
          <Icon path={ICON_PATHS.user} size="md" />
        </button>
      )}
    </div>
  );
}
