"use client";

import { useRef, useCallback } from "react";
import { cn } from "@/lib/cn";
import { Icon, ICON_PATHS } from "@/components/ui/Icon";
import { validateFiles } from "@/lib/attachment-utils";

interface AttachmentButtonProps {
  onFilesSelected: (files: FileList) => void;
  disabled?: boolean;
  multiple?: boolean;
  accept?: string;
}

export function AttachmentButton({
  onFilesSelected,
  disabled = false,
  multiple = true,
  accept,
}: AttachmentButtonProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleClick = useCallback(() => {
    inputRef.current?.click();
  }, []);

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = e.target.files;
      if (!files || files.length === 0) return;

      const validation = validateFiles(Array.from(files));
      if (!validation.valid) {
        // Could emit error via callback or toast
        console.error(validation.error);
        // Reset input
        e.target.value = "";
        return;
      }

      onFilesSelected(files);
      // Reset input so the same file can be selected again
      e.target.value = "";
    },
    [onFilesSelected]
  );

  return (
    <>
      <button
        type="button"
        onClick={handleClick}
        disabled={disabled}
        className={cn(
          "p-2 rounded-xl transition-all duration-200",
          "text-text-secondary hover:text-primary",
          "hover:bg-primary/5",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30",
          disabled && "cursor-not-allowed opacity-40"
        )}
        title="Attach files"
        aria-label="Attach files"
      >
        <Icon path={ICON_PATHS.paperclip} size="md" />
      </button>
      <input
        ref={inputRef}
        type="file"
        multiple={multiple}
        accept={accept}
        onChange={handleChange}
        className="hidden"
        aria-hidden="true"
      />
    </>
  );
}