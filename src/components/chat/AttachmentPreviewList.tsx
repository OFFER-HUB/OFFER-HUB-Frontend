"use client";

import { cn } from "@/lib/cn";
import { AttachmentPreview } from "@/components/chat/AttachmentPreview";
import type { FileAttachment } from "@/types/attachment.types";

interface AttachmentPreviewListProps {
  attachments: FileAttachment[];
  onRemove: (id: string) => void;
  onCancel?: (id: string) => void;
  onRetry?: (id: string) => void;
}

export function AttachmentPreviewList({
  attachments,
  onRemove,
  onCancel,
  onRetry,
}: AttachmentPreviewListProps) {
  if (attachments.length === 0) return null;

  return (
    <div
      className={cn(
        "flex flex-col gap-2 px-4 sm:px-6 pt-3 pb-1",
        "border-t border-border-light",
        "bg-white"
      )}
    >
      {attachments.map((attachment) => (
        <AttachmentPreview
          key={attachment.id}
          attachment={attachment}
          onRemove={onRemove}
          onCancel={onCancel}
          onRetry={onRetry}
        />
      ))}
    </div>
  );
}