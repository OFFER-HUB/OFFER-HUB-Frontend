"use client";

import { cn } from "@/lib/cn";
import { Icon, ICON_PATHS } from "@/components/ui/Icon";
import { ACTION_BUTTON_WARNING } from "@/lib/styles";

export interface BulkActionBarProps {
  selectedCount: number;
  onBanSelected: () => void;
  onClear: () => void;
}

export function BulkActionBar({ selectedCount, onBanSelected, onClear }: BulkActionBarProps) {
  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 flex items-center gap-3 px-5 py-3 rounded-2xl bg-white shadow-[6px_6px_20px_rgba(0,0,0,0.15),-6px_-6px_20px_#ffffff] animate-scale-in">
      <span className="text-sm font-semibold text-text-primary whitespace-nowrap">
        {selectedCount} selected
      </span>

      <div className="w-px h-5 bg-gray-200" />

      <button
        type="button"
        onClick={onBanSelected}
        className={cn(ACTION_BUTTON_WARNING, "px-3 py-2 text-sm")}
      >
        <Icon path={ICON_PATHS.flag} size="sm" />
        Ban Selected
      </button>

      <button
        type="button"
        onClick={onClear}
        className="p-1.5 text-text-secondary hover:text-text-primary transition-colors rounded-lg hover:bg-gray-100"
        aria-label="Clear selection"
      >
        <Icon path={ICON_PATHS.close} size="sm" />
      </button>
    </div>
  );
}
