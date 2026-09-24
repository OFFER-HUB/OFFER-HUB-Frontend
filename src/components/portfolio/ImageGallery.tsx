"use client";

import { useCallback, useState } from "react";
import { cn } from "@/lib/cn";
import { Icon, ICON_PATHS } from "@/components/ui/Icon";
import { NEUMORPHIC_INPUT } from "@/lib/styles";
import { MAX_IMAGE_CAPTION_LENGTH, type PortfolioImageEntry } from "@/types/portfolio.types";

export interface ImageGalleryProps {
  images: PortfolioImageEntry[];
  onReorder: (fromIndex: number, toIndex: number) => void;
  onRemove: (index: number) => void;
  onCaptionChange: (index: number, caption: string) => void;
  disabled?: boolean;
  className?: string;
}

export function ImageGallery({
  images,
  onReorder,
  onRemove,
  onCaptionChange,
  disabled,
  className,
}: ImageGalleryProps): React.JSX.Element {
  const [loadedIds, setLoadedIds] = useState<Record<string, boolean>>({});
  const [dragIndex, setDragIndex] = useState<number | null>(null);

  const markLoaded = useCallback((id: string) => {
    setLoadedIds((prev) => ({ ...prev, [id]: true }));
  }, []);

  if (images.length === 0) return <></>;

  return (
    <div className={cn("space-y-3", className)}>
      <p className="text-xs font-medium text-text-secondary uppercase tracking-wide">
        Gallery
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
        {images.map((img, index) => {
          const loaded = loadedIds[img.id];
          return (
            <div
              key={img.id}
              onDragOver={(e) => {
                e.preventDefault();
                e.dataTransfer.dropEffect = "move";
              }}
              onDrop={(e) => {
                e.preventDefault();
                const from = Number(e.dataTransfer.getData("text/plain"));
                if (!Number.isNaN(from) && from !== index) onReorder(from, index);
                setDragIndex(null);
              }}
              className={cn(
                "rounded-xl border border-border-light/80 bg-white/80 p-2 shadow-[4px_4px_8px_#d1d5db,-4px_-4px_8px_#ffffff]",
                "transition-opacity duration-200",
                dragIndex === index && "opacity-40"
              )}
            >
              <div className="relative aspect-4/3 rounded-lg overflow-hidden bg-gray-100">
                {!loaded && (
                  <div
                    className="absolute inset-0 animate-pulse bg-linear-to-br from-gray-200 to-gray-100"
                    aria-hidden
                  />
                )}
                <img
                  src={img.url}
                  alt={img.caption || `Project image ${index + 1}`}
                  onLoad={() => markLoaded(img.id)}
                  className={cn(
                    "w-full h-full object-cover transition-opacity duration-200",
                    loaded ? "opacity-100" : "opacity-0"
                  )}
                />
                <div
                  draggable={!disabled}
                  onDragStart={(e) => {
                    if (disabled) return;
                    setDragIndex(index);
                    e.dataTransfer.effectAllowed = "move";
                    e.dataTransfer.setData("text/plain", String(index));
                  }}
                  onDragEnd={() => setDragIndex(null)}
                  className="absolute top-1.5 left-1.5 p-1 rounded-md bg-black/45 text-white cursor-grab active:cursor-grabbing"
                  title="Drag to reorder"
                  aria-grabbed={dragIndex === index}
                >
                  <Icon path={ICON_PATHS.menu} size="sm" aria-hidden />
                </div>
                {index === 0 && (
                  <span className="absolute bottom-1.5 left-1.5 px-2 py-0.5 text-[10px] font-medium rounded-md bg-black/55 text-white">
                    Cover
                  </span>
                )}
                <button
                  type="button"
                  disabled={disabled}
                  onClick={() => onRemove(index)}
                  className="absolute top-1.5 right-1.5 w-7 h-7 rounded-full bg-error text-white flex items-center justify-center shadow-md hover:opacity-90 disabled:opacity-50"
                  aria-label={`Remove image ${index + 1}`}
                >
                  <Icon path={ICON_PATHS.close} size="sm" />
                </button>
              </div>
              <label className="mt-2 block">
                <span className="sr-only">Caption or alt text</span>
                <input
                  type="text"
                  value={img.caption ?? ""}
                  onChange={(e) =>
                    onCaptionChange(
                      index,
                      e.target.value.slice(0, MAX_IMAGE_CAPTION_LENGTH)
                    )
                  }
                  disabled={disabled}
                  placeholder="Caption / alt text (optional)"
                  className={cn(
                    NEUMORPHIC_INPUT,
                    "w-full text-xs py-2",
                    disabled && "opacity-60"
                  )}
                  maxLength={MAX_IMAGE_CAPTION_LENGTH}
                />
                <span className="text-[10px] text-text-secondary mt-0.5 block text-right">
                  {(img.caption ?? "").length}/{MAX_IMAGE_CAPTION_LENGTH}
                </span>
              </label>
            </div>
          );
        })}
      </div>
    </div>
  );
}
