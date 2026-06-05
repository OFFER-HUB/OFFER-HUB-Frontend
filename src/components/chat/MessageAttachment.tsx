"use client";

import { useState } from "react";
import { cn } from "@/lib/cn";
import { Icon, ICON_PATHS } from "@/components/ui/Icon";
import { getFileTypeCategory, formatFileSize, downloadAttachment } from "@/lib/api/chat-attachments";
import type { MessageAttachment as MessageAttachmentType } from "@/types/chat.types";

interface MessageAttachmentProps {
  attachment: MessageAttachmentType;
  isOwn?: boolean;
  className?: string;
}

export function MessageAttachment({
  attachment,
  isOwn = false,
  className,
}: MessageAttachmentProps) {
  const [imageError, setImageError] = useState(false);
  const [isImageLoading, setIsImageLoading] = useState(true);
  const fileCategory = getFileTypeCategory(attachment.mimeType);

  const getIconForFileType = () => {
    switch (fileCategory) {
      case "image":
        return ICON_PATHS.image;
      case "video":
        return ICON_PATHS.video;
      case "document":
        return ICON_PATHS.document;
      default:
        return ICON_PATHS.file;
    }
  };

  const handleDownload = () => {
    downloadAttachment(attachment);
  };

  const handleImageLoad = () => {
    setIsImageLoading(false);
  };

  const handleImageError = () => {
    setImageError(true);
    setIsImageLoading(false);
  };

  // Image attachment with thumbnail preview
  if (fileCategory === "image" && !imageError) {
    return (
      <div
        className={cn(
          "relative group",
          "rounded-xl overflow-hidden",
          "shadow-[2px_2px_4px_#d1d5db,-2px_-2px_4px_#ffffff]",
          className
        )}
      >
        <div className="relative">
          <img
            src={attachment.url}
            alt={attachment.name}
            onLoad={handleImageLoad}
            onError={handleImageError}
            className={cn(
              "max-w-[200px] sm:max-w-[280px]",
              "h-auto",
              "cursor-pointer",
              "rounded-xl",
              isImageLoading && "opacity-0"
            )}
            onClick={() => window.open(attachment.url, '_blank')}
          />
          
          {/* Loading state */}
          {isImageLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-background">
              <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
          )}

          {/* Hover overlay with download button */}
          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
            <button
              type="button"
              onClick={handleDownload}
              className="p-2 rounded-lg bg-white/90 hover:bg-white transition-colors"
              title="Download"
            >
              <Icon path={ICON_PATHS.arrowDown} size="md" className="text-text-primary" />
            </button>
            <button
              type="button"
              onClick={() => window.open(attachment.url, '_blank')}
              className="p-2 rounded-lg bg-white/90 hover:bg-white transition-colors"
              title="Open in new tab"
            >
              <Icon path={ICON_PATHS.externalLink} size="md" className="text-text-primary" />
            </button>
          </div>
        </div>

        {/* File info below image */}
        <div className="p-2 bg-background/90 backdrop-blur-sm">
          <p className="text-xs font-medium text-text-primary truncate">{attachment.name}</p>
          <p className="text-[10px] text-text-secondary">{formatFileSize(attachment.size)}</p>
        </div>
      </div>
    );
  }

  // Video attachment
  if (fileCategory === "video") {
    return (
      <div
        className={cn(
          "flex items-center gap-3 p-3 rounded-xl",
          isOwn ? "bg-primary/10" : "bg-background",
          "shadow-[2px_2px_4px_#d1d5db,-2px_-2px_4px_#ffffff]",
          className
        )}
      >
        <div className="shrink-0 w-12 h-12 rounded-lg bg-primary/5 flex items-center justify-center">
          <Icon path={ICON_PATHS.video} size="md" className="text-primary" />
        </div>

        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-text-primary truncate">{attachment.name}</p>
          <p className="text-xs text-text-secondary">{formatFileSize(attachment.size)}</p>
        </div>

        <button
          type="button"
          onClick={() => window.open(attachment.url, '_blank')}
          className="p-2 rounded-lg bg-primary/10 hover:bg-primary/20 transition-colors"
          title="Play video"
        >
          <Icon path={ICON_PATHS.externalLink} size="sm" className="text-primary" />
        </button>

        <button
          type="button"
          onClick={handleDownload}
          className="p-2 rounded-lg bg-primary/10 hover:bg-primary/20 transition-colors"
          title="Download"
        >
          <Icon path={ICON_PATHS.arrowDown} size="sm" className="text-primary" />
        </button>
      </div>
    );
  }

  // Document/file attachment
  return (
    <div
      className={cn(
        "flex items-center gap-3 p-3 rounded-xl",
        isOwn ? "bg-primary/10" : "bg-background",
        "shadow-[2px_2px_4px_#d1d5db,-2px_-2px_4px_#ffffff]",
        className
      )}
    >
      <div className="shrink-0 w-12 h-12 rounded-lg bg-primary/5 flex items-center justify-center">
        <Icon path={getIconForFileType()} size="md" className="text-primary" />
      </div>

      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-text-primary truncate">{attachment.name}</p>
        <p className="text-xs text-text-secondary">{formatFileSize(attachment.size)}</p>
      </div>

      <button
        type="button"
        onClick={handleDownload}
        className="p-2 rounded-lg bg-primary/10 hover:bg-primary/20 transition-colors"
        title="Download"
      >
        <Icon path={ICON_PATHS.arrowDown} size="sm" className="text-primary" />
      </button>
    </div>
  );
}
