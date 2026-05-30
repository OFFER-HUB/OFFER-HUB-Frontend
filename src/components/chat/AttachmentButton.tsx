"use client";

import { useRef } from "react";
import { cn } from "@/lib/cn";
import { Icon, ICON_PATHS } from "@/components/ui/Icon";

interface AttachmentButtonProps {
  onFilesSelected: (files: File[]) => void;
  disabled?: boolean;
  className?: string;
  accept?: string;
  multiple?: boolean;
}

export function AttachmentButton({
  onFilesSelected,
  disabled = false,
  className,
  accept = "*/*",
  multiple = true,
}: AttachmentButtonProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleClick = () => {
    if (!disabled) {
      fileInputRef.current?.click();
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 0) {
      onFilesSelected(files);
    }
    // Reset input so same files can be selected again
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <>
      <input
        ref={fileInputRef}
        type="file"
        accept={accept}
        multiple={multiple}
        onChange={handleFileChange}
        className="hidden"
        aria-label="Attach files"
      />
      <button
        type="button"
        onClick={handleClick}
        disabled={disabled}
        className={cn(
          "p-2.5 rounded-xl transition-all duration-200",
          disabled
            ? cn(
                "bg-background text-text-secondary",
                "shadow-[3px_3px_6px_#d1d5db,-3px_-3px_6px_#ffffff]",
                "cursor-not-allowed"
              )
            : cn(
                "bg-background text-text-primary",
                "shadow-[3px_3px_6px_#d1d5db,-3px_-3px_6px_#ffffff]",
                "hover:shadow-[2px_2px_4px_#d1d5db,-2px_-2px_4px_#ffffff]",
                "active:shadow-[inset_2px_2px_4px_#d1d5db,inset_-2px_-2px_4px_#ffffff]"
              ),
          className
        )}
        title="Attach files"
        aria-label="Attach files"
      >
        <Icon path={ICON_PATHS.paperclip} size="md" />
      </button>
    </>
  );
}
