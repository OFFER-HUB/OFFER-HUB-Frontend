"use client";

import { useCallback, useRef, useState } from "react";
import { cn } from "@/lib/cn";
import { Icon, ICON_PATHS, LoadingSpinner } from "@/components/ui/Icon";
import { compressImageFile } from "@/lib/image-compress";
import { uploadPortfolioImage } from "@/lib/api/portfolio-images";
import { newPortfolioImageId } from "@/lib/portfolio-image-helpers";
import {
  ALLOWED_IMAGE_TYPES,
  MAX_FILE_SIZE,
  validatePortfolioImageFile,
} from "@/data/portfolio.data";
import type { PortfolioImageEntry } from "@/types/portfolio.types";

type PendingRow = {
  id: string;
  previewUrl: string;
  file: File;
  progress: number;
};

export interface ImageUploaderProps {
  token: string | null;
  maxTotal: number;
  currentCount: number;
  onImagesAdded: (entries: PortfolioImageEntry[]) => void;
  error?: string;
  disabled?: boolean;
  className?: string;
}

export function ImageUploader({
  token,
  maxTotal,
  currentCount,
  onImagesAdded,
  error: externalError,
  disabled,
  className,
}: ImageUploaderProps): React.JSX.Element {
  const [isDragging, setIsDragging] = useState(false);
  const [pending, setPending] = useState<PendingRow[]>([]);
  const [localError, setLocalError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const remainingSlots = Math.max(0, maxTotal - currentCount);
  const busy = pending.length > 0;
  const canAddMore = remainingSlots > 0 && !disabled;

  const processFile = useCallback(
    async (file: File) => {
      const validationError = validatePortfolioImageFile(file);
      if (validationError) {
        setLocalError(validationError);
        return;
      }

      let compressed: File;
      try {
        compressed = await compressImageFile(file);
      } catch {
        setLocalError("Could not process this image — try another file");
        return;
      }

      const validationAfter = validatePortfolioImageFile(compressed);
      if (validationAfter) {
        setLocalError(validationAfter);
        return;
      }

      const rowId = newPortfolioImageId();
      const previewUrl = URL.createObjectURL(compressed);
      setPending((prev) => [...prev, { id: rowId, previewUrl, file: compressed, progress: 0 }]);
      setLocalError(null);

      try {
        const { url } = await uploadPortfolioImage(token, compressed, (pct) => {
          setPending((prev) =>
            prev.map((r) => (r.id === rowId ? { ...r, progress: pct } : r))
          );
        });
        URL.revokeObjectURL(previewUrl);
        setPending((prev) => prev.filter((r) => r.id !== rowId));
        onImagesAdded([
          {
            id: newPortfolioImageId(),
            url,
          },
        ]);
      } catch (err) {
        URL.revokeObjectURL(previewUrl);
        setPending((prev) => prev.filter((r) => r.id !== rowId));
        setLocalError(err instanceof Error ? err.message : "Upload failed");
      }
    },
    [onImagesAdded, token]
  );

  const handleFiles = useCallback(
    (files: FileList | null) => {
      if (!files?.length || !canAddMore) return;
      const list = Array.from(files);
      const slice = list.slice(0, remainingSlots);
      slice.forEach((f) => {
        void processFile(f);
      });
    },
    [canAddMore, processFile, remainingSlots]
  );

  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    if (canAddMore) setIsDragging(true);
  };

  const onDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    handleFiles(e.dataTransfer.files);
  };

  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleFiles(e.target.files);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const error = externalError ?? localError;

  return (
    <div className={cn("space-y-3", className)}>
      <div
        onClick={() => canAddMore && fileInputRef.current?.click()}
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onDrop={onDrop}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            if (canAddMore) fileInputRef.current?.click();
          }
        }}
        aria-disabled={!canAddMore}
        aria-label="Upload portfolio images"
        className={cn(
          "border-2 border-dashed border-border-light rounded-xl p-6 sm:p-8",
          "flex flex-col items-center justify-center gap-2 sm:gap-3 text-center",
          "transition-all duration-200",
          canAddMore && "cursor-pointer hover:border-primary/50 hover:bg-primary/5",
          isDragging && canAddMore && "border-primary bg-primary/10",
          (error || externalError) && "border-error bg-error/5",
          !canAddMore && "opacity-60 cursor-not-allowed"
        )}
      >
        <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-primary/10 flex items-center justify-center">
          {busy ? (
            <LoadingSpinner size="sm" className="text-primary" />
          ) : (
            <Icon path={ICON_PATHS.upload} size="lg" className="text-primary" />
          )}
        </div>
        <p className="text-sm text-text-primary font-medium px-2">
          {canAddMore
            ? "Drag images here or click to browse"
            : "Maximum number of images reached"}
        </p>
        <p className="text-xs text-text-secondary max-w-sm px-2">
          JPEG, PNG, WebP, or GIF · up to {MAX_FILE_SIZE / (1024 * 1024)}MB each
        </p>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept={ALLOWED_IMAGE_TYPES.join(",")}
        onChange={onChange}
        disabled={!canAddMore}
        className="hidden"
      />

      {pending.length > 0 && (
        <div className="space-y-2" aria-live="polite">
          {pending.map((row) => (
            <div
              key={row.id}
              className="flex items-center gap-3 p-2 rounded-xl bg-white shadow-[inset_2px_2px_4px_#d1d5db,inset_-2px_-2px_4px_#ffffff]"
            >
              <div className="relative w-14 h-14 rounded-lg overflow-hidden shrink-0 bg-gray-100">
                <img
                  src={row.previewUrl}
                  alt=""
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-text-secondary truncate max-w-xs">
                  {row.file.name}
                </p>
                <div className="mt-1 h-2 rounded-full bg-gray-200 overflow-hidden">
                  <div
                    className="h-full bg-primary transition-[width] duration-150 ease-out rounded-full"
                    style={{ width: `${row.progress}%` }}
                  />
                </div>
                <p className="text-[10px] text-text-secondary mt-0.5">
                  Uploading… {row.progress}%
                </p>
              </div>
            </div>
          ))}
        </div>
      )}

      {error && (
        <p className="text-sm text-error flex items-start gap-1.5">
          <Icon path={ICON_PATHS.alertCircle} size="sm" className="shrink-0 mt-0.5" />
          {error}
        </p>
      )}
    </div>
  );
}
