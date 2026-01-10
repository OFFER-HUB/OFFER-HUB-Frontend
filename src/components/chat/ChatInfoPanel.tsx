"use client";

import { cn } from "@/lib/cn";
import { Icon, ICON_PATHS } from "@/components/ui/Icon";
import type { ChatUser, SharedFile } from "@/types/chat.types";

interface ChatInfoPanelProps {
  participant: ChatUser;
  sharedFiles: SharedFile[];
  onClose?: () => void;
}

const FILE_ICONS: Record<SharedFile["type"], string> = {
  document: ICON_PATHS.document,
  image: ICON_PATHS.image,
  video: ICON_PATHS.video,
  other: ICON_PATHS.folder,
};

const FILE_COLORS: Record<SharedFile["type"], string> = {
  document: "text-blue-500",
  image: "text-green-500",
  video: "text-purple-500",
  other: "text-orange-500",
};

export function ChatInfoPanel({ participant, sharedFiles, onClose }: ChatInfoPanelProps) {
  return (
    <div className="flex flex-col h-full bg-white">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-border-light">
        <h3 className="font-semibold text-text-primary">Chat Info</h3>
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            className={cn(
              "p-1.5 rounded-lg cursor-pointer",
              "text-text-secondary hover:text-text-primary",
              "hover:bg-background",
              "transition-all duration-200"
            )}
          >
            <Icon path={ICON_PATHS.close} size="sm" />
          </button>
        )}
      </div>

      {/* Profile Section */}
      <div className="p-6 text-center border-b border-border-light">
        <div
          className={cn(
            "w-20 h-20 mx-auto mb-4 rounded-full flex items-center justify-center",
            "bg-gradient-to-br from-primary/20 to-secondary/20",
            "shadow-[4px_4px_8px_#d1d5db,-4px_-4px_8px_#ffffff]"
          )}
        >
          <span className="text-2xl font-bold text-text-primary">
            {participant.avatar}
          </span>
        </div>
        <h3 className="text-lg font-bold text-text-primary mb-1">
          {participant.name}
        </h3>
        <p className="text-sm text-text-secondary mb-2">{participant.title}</p>
        <span
          className={cn(
            "inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium",
            participant.isOnline
              ? "bg-green-100 text-green-700"
              : "bg-gray-100 text-gray-600"
          )}
        >
          <span
            className={cn(
              "w-2 h-2 rounded-full",
              participant.isOnline ? "bg-green-500" : "bg-gray-400"
            )}
          />
          {participant.isOnline ? "Online" : "Offline"}
        </span>
      </div>

      {/* Shared Files Section */}
      <div className="flex-1 overflow-y-auto p-4">
        <h4 className="text-sm font-semibold text-text-primary mb-3">
          Shared Files
        </h4>
        <div className="space-y-2">
          {sharedFiles.map((file) => (
            <button
              key={file.id}
              type="button"
              className={cn(
                "w-full flex items-center gap-3 p-3 rounded-xl",
                "bg-background",
                "shadow-[2px_2px_4px_#d1d5db,-2px_-2px_4px_#ffffff]",
                "hover:shadow-[3px_3px_6px_#d1d5db,-3px_-3px_6px_#ffffff]",
                "transition-all duration-200 cursor-pointer",
                "text-left"
              )}
            >
              <div
                className={cn(
                  "w-10 h-10 rounded-lg flex items-center justify-center",
                  "bg-white",
                  "shadow-[inset_1px_1px_2px_#d1d5db,inset_-1px_-1px_2px_#ffffff]"
                )}
              >
                <Icon
                  path={FILE_ICONS[file.type]}
                  size="md"
                  className={FILE_COLORS[file.type]}
                />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-text-primary truncate">
                  {file.name}
                </p>
                <p className="text-xs text-text-secondary">
                  {file.count} files • {file.size}
                </p>
              </div>
              <Icon
                path={ICON_PATHS.chevronRight}
                size="sm"
                className="text-text-secondary"
              />
            </button>
          ))}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="p-4 border-t border-border-light">
        <div className="grid grid-cols-3 gap-2">
          <button
            type="button"
            className={cn(
              "flex flex-col items-center gap-1 p-3 rounded-xl",
              "bg-background cursor-pointer",
              "shadow-[2px_2px_4px_#d1d5db,-2px_-2px_4px_#ffffff]",
              "hover:shadow-[3px_3px_6px_#d1d5db,-3px_-3px_6px_#ffffff]",
              "transition-all duration-200"
            )}
          >
            <Icon path={ICON_PATHS.link} size="md" className="text-primary" />
            <span className="text-[10px] text-text-secondary">Share</span>
          </button>
          <button
            type="button"
            className={cn(
              "flex flex-col items-center gap-1 p-3 rounded-xl",
              "bg-background cursor-pointer",
              "shadow-[2px_2px_4px_#d1d5db,-2px_-2px_4px_#ffffff]",
              "hover:shadow-[3px_3px_6px_#d1d5db,-3px_-3px_6px_#ffffff]",
              "transition-all duration-200"
            )}
          >
            <Icon path={ICON_PATHS.bell} size="md" className="text-primary" />
            <span className="text-[10px] text-text-secondary">Mute</span>
          </button>
          <button
            type="button"
            className={cn(
              "flex flex-col items-center gap-1 p-3 rounded-xl",
              "bg-background cursor-pointer",
              "shadow-[2px_2px_4px_#d1d5db,-2px_-2px_4px_#ffffff]",
              "hover:shadow-[3px_3px_6px_#d1d5db,-3px_-3px_6px_#ffffff]",
              "transition-all duration-200"
            )}
          >
            <Icon path={ICON_PATHS.flag} size="md" className="text-red-500" />
            <span className="text-[10px] text-text-secondary">Report</span>
          </button>
        </div>
      </div>
    </div>
  );
}
