"use client";

import { useState, useEffect } from "react";
import { cn } from "@/lib/cn";
import { Icon, ICON_PATHS, LoadingSpinner } from "@/components/ui/Icon";
import { getFileTypeCategory, formatFileSize } from "@/lib/api/chat-attachments";
import type { FileUploadProgress } from "@/types/chat.types";

interface AttachmentPreviewProps {
  uploadProgress: FileUploadProgress;
  onCancel: () => void;
  onRetry?: () => void;
  className?: string;
}

export function AttachmentPreview({
  uploadProgress,
  onCancel,
  onRetry,
  className,
}: AttachmentPreviewProps) {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileCategory = getFileTypeCategory(uploadProgress.mimeType);

  useEffect(() => {
    // Generate preview for images
    if (fileCategory === "image" && uploadProgress.status !== "error") {
      // In a real implementation, you'd create an object URL from the file
      // For now, we'll use a placeholder
      setPreviewUrl(null);
    }
  }, [fileCategory, uploadProgress.status]);

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

  return (
    <div
      className={cn(
        "flex items-center gap-3 p-3 rounded-xl",
        "bg-background",
        "shadow-[inset_2px_2px_4px_#d1d5db,inset_-2px_-2px_4px_#ffffff]",
        className
      )}
    >
      {/* File thumbnail or icon */}
      <div className="shrink-0 w-12 h-12 rounded-lg overflow-hidden bg-primary/5 flex items-center justify-center">
        {previewUrl ? (
          <img src={previewUrl} alt={uploadProgress.fileName} className="w-full h-full object-cover" />
        ) : (
          <Icon path={getIconForFileType()} size="md" className="text-text-secondary" />
        )}
      </div>

      {/* File info */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-text-primary truncate">{uploadProgress.fileName}</p>
        <div className="flex items-center gap-2 mt-1">
          <span className="text-xs text-text-secondary">{formatFileSize(uploadProgress.fileSize)}</span>
          {uploadProgress.status === "uploading" && (
            <span className="text-xs text-text-secondary">• {uploadProgress.progress}%</span>
          )}
          {uploadProgress.status === "error" && (
            <span className="text-xs text-error">• Failed to upload</span>
          )}
          {uploadProgress.status === "completed" && (
            <span className="text-xs text-green-600">• Uploaded</span>
          )}
        </div>
      </div>

      {/* Status indicator */}
      <div className="shrink-0">
        {uploadProgress.status === "uploading" && (
          <div className="flex items-center gap-2">
            <LoadingSpinner size="sm" className="text-primary" />
            <button
              type="button"
              onClick={onCancel}
              className="p-1 rounded hover:bg-border-light transition-colors"
              title="Cancel upload"
            >
              <Icon path={ICON_PATHS.close} size="sm" className="text-text-secondary" />
            </button>
          </div>
        )}
        {uploadProgress.status === "completed" && (
          <button
            type="button"
            onClick={onCancel}
            className="p-1 rounded hover:bg-border-light transition-colors"
            title="Remove"
          >
            <Icon path={ICON_PATHS.close} size="sm" className="text-text-secondary" />
          </button>
        )}
        {uploadProgress.status === "error" && (
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onRetry}
              className="p-1 rounded hover:bg-border-light transition-colors"
              title="Retry upload"
            >
              <Icon path={ICON_PATHS.refresh} size="sm" className="text-text-secondary" />
            </button>
            <button
              type="button"
              onClick={onCancel}
              className="p-1 rounded hover:bg-border-light transition-colors"
              title="Remove"
            >
              <Icon path={ICON_PATHS.close} size="sm" className="text-text-secondary" />
            </button>
          </div>
        )}
      </div>

      {/* Progress bar */}
      {uploadProgress.status === "uploading" && (
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-border-light rounded-b-xl overflow-hidden">
          <div
            className="h-full bg-primary transition-all duration-300"
            style={{ width: `${uploadProgress.progress}%` }}
          />
        </div>
      )}
    </div>
  );
}
