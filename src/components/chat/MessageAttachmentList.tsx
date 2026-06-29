"use client";

import { cn } from "@/lib/cn";
import { MessageAttachment } from "@/components/chat/MessageAttachment";
import type { MessageAttachment as MessageAttachmentType } from "@/types/attachment.types";

interface MessageAttachmentListProps {
  attachments: MessageAttachmentType[];
  className?: string;
}

export function MessageAttachmentList({
  attachments,
  className,
}: MessageAttachmentListProps) {
  if (!attachments || attachments.length === 0) return null;

  return (
    <div
      className={cn(
        "flex flex-col gap-2 mt-2",
        className
      )}
    >
      {attachments.map((attachment) => (
        <MessageAttachment
          key={attachment.id}
          attachment={attachment}
        />
      ))}
    </div>
  );
}