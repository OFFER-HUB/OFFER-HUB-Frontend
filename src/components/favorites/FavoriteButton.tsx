"use client";

import { useState } from "react";
import { cn } from "@/lib/cn";
import { ICON_PATHS } from "@/components/ui/Icon";
import type { FavoriteType } from "@/types/favorites.types";

interface FavoriteButtonProps {
  type: FavoriteType;
  id: string;
  isFavorited: boolean;
  onToggle: () => void;
  className?: string;
}

export function FavoriteButton({
  isFavorited,
  onToggle,
  className,
}: FavoriteButtonProps): React.JSX.Element {
  const [loading, setLoading] = useState(false);

  async function handleClick(e: React.MouseEvent): Promise<void> {
    e.preventDefault();
    e.stopPropagation();
    if (loading) return;
    setLoading(true);
    onToggle();
    // Simulate async for future backend integration
    await new Promise((r) => setTimeout(r, 150));
    setLoading(false);
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={loading}
      aria-label={isFavorited ? "Remove from favorites" : "Add to favorites"}
      className={cn(
        "flex items-center justify-center w-9 h-9 rounded-xl transition-all duration-200",
        "bg-background",
        isFavorited
          ? "shadow-[inset_2px_2px_4px_#d1d5db,inset_-2px_-2px_4px_#ffffff] text-red-500"
          : "shadow-[2px_2px_4px_#d1d5db,-2px_-2px_4px_#ffffff] text-text-secondary hover:text-red-400",
        loading && "opacity-60",
        className
      )}
    >
      <svg
        className={cn("w-4 h-4 transition-transform duration-200", isFavorited && "scale-110")}
        fill={isFavorited ? "currentColor" : "none"}
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={2}
        aria-hidden="true"
      >
        <path strokeLinecap="round" strokeLinejoin="round" d={ICON_PATHS.heart} />
      </svg>
    </button>
  );
}
