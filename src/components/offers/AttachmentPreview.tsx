"use client";

import { cn } from "@/lib/cn";
import { Icon, ICON_PATHS } from "@/components/ui/Icon";
import { formatFileSize } from "@/data/client-offer.data";
import type { Attachment } from "@/types/client-offer.types";

export interface AttachmentPreviewProps {
  attachment: Attachment;
  onRemove: () => void;
  displaySize?: number;
}

export function AttachmentPreview({ attachment, onRemove, displaySize }: AttachmentPreviewProps): React.JSX.Element {
  const iconPath = attachment.type === "image" ? ICON_PATHS.image : ICON_PATHS.document;

  return (
    <div
      className={cn(
        "relative group rounded-xl overflow-hidden",
        "bg-background",
        "shadow-[2px_2px_4px_#d1d5db,-2px_-2px_4px_#ffffff]"
      )}
    >
      {attachment.type === "image" && attachment.preview ? (
        <div className="aspect-square">
          <img
            src={attachment.preview}
            alt={attachment.file.name}
            className="w-full h-full object-cover"
          />
        </div>
      ) : (
        <div className="aspect-square flex flex-col items-center justify-center p-3">
          <Icon path={iconPath} size="xl" className="text-primary mb-2" />
          <p className="text-xs text-text-primary text-center truncate w-full px-1">
            {attachment.file.name.split(".").pop()?.toUpperCase()}
          </p>
        </div>
      )}

      <div className="absolute inset-x-0 bottom-0 bg-black/60 p-2">
        <p className="text-xs text-white truncate">{attachment.file.name}</p>
        <p className="text-xs text-white/70">{formatFileSize(displaySize ?? attachment.file.size)}</p>
      </div>

      <button
        type="button"
        onClick={onRemove}
        className={cn(
          "absolute top-2 right-2",
          "w-6 h-6 rounded-full",
          "bg-error text-white",
          "flex items-center justify-center",
          "opacity-0 group-hover:opacity-100",
          "transition-opacity duration-200",
          "cursor-pointer"
        )}
      >
        <Icon path={ICON_PATHS.close} size="sm" />
      </button>
    </div>
  );
}
