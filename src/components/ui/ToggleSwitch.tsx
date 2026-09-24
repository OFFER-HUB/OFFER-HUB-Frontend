"use client";

import { cn } from "@/lib/cn";

export interface ToggleSwitchProps {
  enabled: boolean;
  onChange: () => void;
  label: string;
  description?: string;
}

const TOGGLE_STYLES = cn(
  "relative w-12 h-6 rounded-full transition-all duration-200 cursor-pointer",
  "shadow-[inset_2px_2px_4px_#d1d5db,inset_-2px_-2px_4px_#ffffff]"
);

const TOGGLE_THUMB = cn(
  "absolute top-0.5 w-5 h-5 rounded-full transition-all duration-200",
  "shadow-[2px_2px_4px_#d1d5db,-2px_-2px_4px_#ffffff]",
  "bg-white"
);

export function ToggleSwitch({
  enabled,
  onChange,
  label,
  description,
}: ToggleSwitchProps): React.JSX.Element {
  return (
    <div className="flex items-start justify-between gap-4 py-3">
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-text-primary">{label}</p>
        {description && <p className="text-xs text-text-secondary mt-0.5">{description}</p>}
      </div>
      <button
        type="button"
        onClick={onChange}
        className={cn(TOGGLE_STYLES, "flex-shrink-0", enabled ? "bg-primary" : "bg-background")}
        role="switch"
        aria-checked={enabled}
        aria-label={label}
      >
        <span className={cn(TOGGLE_THUMB, enabled ? "left-6" : "left-0.5")} />
      </button>
    </div>
  );
}
