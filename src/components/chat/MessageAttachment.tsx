"use client";

import { useCallback } from "react";
import { cn } from "@/lib/cn";
import { Icon, ICON_PATHS } from "@/components/ui/Icon";
import {
  formatFileSize,
  getFileIconType,
  isImageFile,
  downloadAttachment,
} from "@/lib/attachment-utils";
import type { MessageAttachment as MessageAttachmentType } from "@/types/attachment.types";

interface MessageAttachmentProps {
  attachment: MessageAttachmentType;
  className?: string;
}

export function MessageAttachment({
  attachment,
  className,
}: MessageAttachmentProps) {
  const { name, mimeType, size, url, thumbnailUrl } = attachment;
  const isImage = isImageFile(mimeType);

  const handleDownload = useCallback(() => {
    downloadAttachment(url, name);
  }, [url, name]);

  const iconType = getFileIconType(mimeType);

  const iconMap = {
    image: ICON_PATHS.image,
    document: ICON_PATHS.document,
    archive: ICON_PATHS.folder,
    generic: ICON_PATHS.document,
  };

  // Image attachment - inline preview
  if (isImage) {
    return (
      <div className={cn("group relative", className)}>
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="block rounded-xl overflow-hidden"
        >
          <img
            src={thumbnailUrl || url}
            alt={name}
            className={cn(
              "max-w-full max-h-64 object-cover rounded-xl",
              "shadow-[2px_2px_4px_#d1d5db,-2px_-2px_4px_#ffffff]",
              "transition-transform duration-200 group-hover:scale-[1.02]"
            )}
            loading="lazy"
          />
        </a>
        {/* Hover overlay with download */}
        <div
          className={cn(
            "absolute inset-0 rounded-xl bg-black/0 group-hover:bg-black/20",
            "flex items-end justify-end p-2",
            "opacity-0 group-hover:opacity-100 transition-opacity duration-200"
          )}
        >
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              handleDownload();
            }}
            className={cn(
              "p-2 rounded-lg bg-white/90 backdrop-blur-sm",
              "text-text-primary hover:text-primary",
              "shadow-md transition-colors"
            )}
            title="Download"
            aria-label={`Download ${name}`}
          >
            <Icon path={ICON_PATHS.download} size="sm" />
          </button>
        </div>
        <p className="mt-1.5 text-xs text-text-secondary truncate px-0.5">
          {name} · {formatFileSize(size)}
        </p>
      </div>
    );
  }

  // Non-image attachment - file card
  return (
    <div
      className={cn(
        "flex items-center gap-3 p-3 rounded-xl",
        "bg-background",
        "shadow-[2px_2px_4px_#d1d5db,-2px_-2px_4px_#ffffff]",
        "hover:shadow-[3px_3px_6px_#d1d5db,-3px_-3px_6px_#ffffff]",
        "transition-shadow duration-200",
        className
      )}
    >
      {/* File Icon */}
      <div
        className={cn(
          "flex-shrink-0 w-10 h-10 rounded-lg",
          "bg-primary/5 flex items-center justify-center"
        )}
      >
        <Icon path={iconMap[iconType]} size="lg" className="text-primary" />
      </div>

      {/* File Info */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-text-primary truncate">
          {name}
        </p>
        <p className="text-xs text-text-secondary">
          {formatFileSize(size)}
        </p>
      </div>

      {/* Download Button */}
      <button
        type="button"
        onClick={handleDownload}
        className={cn(
          "flex-shrink-0 p-2 rounded-lg",
          "text-text-secondary hover:text-primary hover:bg-primary/5",
          "transition-colors",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30"
        )}
        title="Download"
        aria-label={`Download ${name}`}
      >
        <Icon path={ICON_PATHS.download} size="md" />
      </button>
    </div>
  );
}