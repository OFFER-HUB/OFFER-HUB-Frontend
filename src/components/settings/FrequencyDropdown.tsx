"use client";

import React, { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/cn";
import { NEUMORPHIC_INPUT } from "@/lib/styles";
import { Icon, ICON_PATHS } from "@/components/ui/Icon";
import type { NotificationFrequency } from "@/types/notification-preferences.types";

const FREQUENCY_OPTIONS: Array<{ value: NotificationFrequency; label: string }> = [
  { value: "instant", label: "Instant" },
  { value: "daily_digest", label: "Daily digest" },
  { value: "off", label: "Off" },
];

const FREQUENCY_SELECT_STYLES = cn(
  NEUMORPHIC_INPUT,
  "h-11 w-full appearance-none cursor-pointer pl-4 pr-12 py-2 text-sm leading-5"
);

function getFrequencyLabel(value: NotificationFrequency): string {
  return FREQUENCY_OPTIONS.find((option) => option.value === value)?.label ?? "Instant";
}

export interface FrequencyDropdownProps {
  value: NotificationFrequency;
  onChange: (value: NotificationFrequency) => void;
  disabled: boolean;
  align?: "left" | "right";
  direction?: "down" | "up";
}

export function FrequencyDropdown({
  value,
  onChange,
  disabled,
  align = "left",
  direction = "down",
}: FrequencyDropdownProps): React.JSX.Element {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent): void {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    function handleEscape(event: KeyboardEvent): void {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className={cn("relative w-full max-w-full min-w-0", isOpen ? "z-[90]" : "z-10")}
    >
      <button
        type="button"
        onClick={() => {
          if (!disabled) {
            setIsOpen((current) => !current);
          }
        }}
        disabled={disabled}
        className={cn(
          FREQUENCY_SELECT_STYLES,
          "flex items-center justify-between text-left",
          disabled && "cursor-not-allowed opacity-60"
        )}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
      >
        <span className="truncate pr-3">{getFrequencyLabel(value)}</span>
        <span className="pointer-events-none absolute right-3 top-1/2 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-lg bg-background/90 shadow-[inset_1px_1px_2px_#d1d5db,inset_-1px_-1px_2px_#ffffff]">
          <Icon
            path={ICON_PATHS.chevronDown}
            size="sm"
            className={cn("text-text-secondary transition-transform", isOpen && "rotate-180")}
          />
        </span>
      </button>

      {isOpen && !disabled && (
        <ul
          className={cn(
            "absolute z-[100] max-h-56 w-full overflow-y-auto rounded-xl border border-border-light bg-white p-1 shadow-[10px_10px_24px_rgba(15,23,42,0.14)]",
            direction === "up" ? "bottom-[calc(100%+0.5rem)]" : "top-[calc(100%+0.5rem)]",
            align === "right" ? "right-0" : "left-0"
          )}
          role="listbox"
        >
          {FREQUENCY_OPTIONS.map((option) => {
            const isSelected = option.value === value;

            return (
              <li key={option.value}>
                <button
                  type="button"
                  onClick={() => {
                    onChange(option.value);
                    setIsOpen(false);
                  }}
                  className={cn(
                    "flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-sm transition-colors",
                    isSelected
                      ? "bg-primary/10 font-medium text-primary"
                      : "text-text-primary hover:bg-background"
                  )}
                  role="option"
                  aria-selected={isSelected}
                >
                  <span>{option.label}</span>
                  {isSelected && <Icon path={ICON_PATHS.check} size="sm" className="text-primary" />}
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
