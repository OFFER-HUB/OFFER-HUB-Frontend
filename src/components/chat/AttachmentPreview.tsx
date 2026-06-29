"use client";

import { useCallback } from "react";
import { cn } from "@/lib/cn";
import { Icon, ICON_PATHS } from "@/components/ui/Icon";
import {
  formatFileSize,
  getFileIconType,
  isImageFile,
} from "@/lib/attachment-utils";
import type { FileAttachment } from "@/types/attachment.types";

interface AttachmentPreviewProps {
  attachment: FileAttachment;
  onRemove: (id: string) => void;
  onCancel?: (id: string) => void;
  onRetry?: (id: string) => void;
}

export function AttachmentPreview({
  attachment,
  onRemove,
  onCancel,
  onRetry,
}: AttachmentPreviewProps) {
  const { id, name, mimeType, size, previewUrl, status, progress, error } =
    attachment;

  const isUploading = status === "uploading";
  const isError = status === "error";
  const isImage = isImageFile(mimeType);

  const handleRemove = useCallback(() => {
    onRemove(id);
  }, [id, onRemove]);

  const handleCancel = useCallback(() => {
    onCancel?.(id);
  }, [id, onCancel]);

  const handleRetry = useCallback(() => {
    onRetry?.(id);
  }, [id, onRetry]);

  const iconType = getFileIconType(mimeType);

  const iconMap = {
    image: ICON_PATHS.image,
    document: ICON_PATHS.document,
    archive: ICON_PATHS.folder,
    generic: ICON_PATHS.document,
  };

  return (
    <div
      className={cn(
        "relative group flex items-center gap-3 p-3 rounded-xl",
        "bg-background",
        "shadow-[2px_2px_4px_#d1d5db,-2px_-2px_4px_#ffffff]",
        isError && "border border-error/30",
        "transition-all duration-200"
      )}
    >
      {/* Thumbnail / Icon */}
      <div
        className={cn(
          "flex-shrink-0 w-12 h-12 rounded-lg overflow-hidden flex items-center justify-center",
          isImage && previewUrl ? "bg-transparent" : "bg-primary/5"
        )}
      >
        {isImage && previewUrl ? (
          <img
            src={previewUrl}
            alt={name}
            className="w-full h-full object-cover"
          />
        ) : (
          <Icon
            path={iconMap[iconType]}
            size="lg"
            className={cn("text-primary", isError && "text-error")}
          />
        )}
      </div>

      {/* File Info */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-text-primary truncate">
          {name}
        </p>
        <div className="flex items-center gap-2 mt-0.5">
          <span className="text-xs text-text-secondary">
            {formatFileSize(size)}
          </span>
          {isUploading && (
            <span className="text-xs text-primary font-medium">
              {progress}%
            </span>
          )}
          {isError && (
            <span className="text-xs text-error font-medium">
              Upload failed
            </span>
          )}
        </div>

        {/* Progress Bar */}
        {isUploading && (
          <div className="mt-2 h-1.5 w-full bg-border-light rounded-full overflow-hidden">
            <div
              className="h-full bg-primary rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        )}

        {/* Error Message */}
        {isError && error && (
          <p className="mt-1 text-xs text-error truncate">{error}</p>
        )}
      </div>

      {/* Actions */}
      <div className="flex items-center gap-1">
        {isUploading && onCancel && (
          <button
            type="button"
            onClick={handleCancel}
            className={cn(
              "p-1.5 rounded-lg transition-colors",
              "text-text-secondary hover:text-error hover:bg-error/5",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-error/30"
            )}
            title="Cancel upload"
            aria-label="Cancel upload"
          >
            <Icon path={ICON_PATHS.close} size="sm" />
          </button>
        )}

        {isError && onRetry && (
          <button
            type="button"
            onClick={handleRetry}
            className={cn(
              "p-1.5 rounded-lg transition-colors",
              "text-text-secondary hover:text-primary hover:bg-primary/5",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30"
            )}
            title="Retry upload"
            aria-label="Retry upload"
          >
            <Icon path={ICON_PATHS.refresh} size="sm" />
          </button>
        )}

        <button
          type="button"
          onClick={handleRemove}
          disabled={isUploading}
          className={cn(
            "p-1.5 rounded-lg transition-colors",
            "text-text-secondary hover:text-error hover:bg-error/5",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-error/30",
            isUploading && "opacity-40 cursor-not-allowed"
          )}
          title="Remove file"
          aria-label="Remove file"
        >
          <Icon path={ICON_PATHS.close} size="sm" />
        </button>
      </div>
    </div>
  );
}