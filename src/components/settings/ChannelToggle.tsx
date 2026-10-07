import React from "react";
import { cn } from "@/lib/cn";

export interface ChannelToggleProps {
  label: string;
  enabled: boolean;
  onClick: () => void;
  disabled: boolean;
}

export function ChannelToggle({
  label,
  enabled,
  onClick,
  disabled,
}: ChannelToggleProps): React.JSX.Element {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "relative h-6 w-12 rounded-full transition-all duration-200",
        "shadow-[inset_2px_2px_4px_#d1d5db,inset_-2px_-2px_4px_#ffffff]",
        enabled ? "bg-primary" : "bg-background",
        disabled && "cursor-not-allowed opacity-60"
      )}
      role="switch"
      aria-checked={enabled}
      aria-label={label}
    >
      <span
        className={cn(
          "absolute top-0.5 h-5 w-5 rounded-full bg-white transition-all duration-200",
          "shadow-[2px_2px_4px_#d1d5db,-2px_-2px_4px_#ffffff]",
          enabled ? "left-6" : "left-0.5"
        )}
      />
    </button>
  );
}
