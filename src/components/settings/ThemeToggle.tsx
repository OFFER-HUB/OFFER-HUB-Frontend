import React from "react";
import { cn } from "@/lib/cn";
import { THEME_OPTIONS } from "@/lib/preferences";
import type { UserPreferences } from "@/types/preferences.types";

export interface ThemeToggleProps {
  value: UserPreferences["theme"];
  onChange: (value: UserPreferences["theme"]) => void;
}

export function ThemeToggle({ value, onChange }: ThemeToggleProps): React.JSX.Element {
  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
      {THEME_OPTIONS.map((option) => {
        const isActive = option.value === value;

        return (
          <button
            key={option.value}
            type="button"
            onClick={() => onChange(option.value)}
            className={cn(
              "rounded-2xl border p-4 text-left transition-all duration-200",
              isActive
                ? "border-primary bg-primary/10 shadow-[inset_2px_2px_4px_rgba(20,154,155,0.12)]"
                : "border-border-light bg-white shadow-[4px_4px_8px_#d1d5db,-4px_-4px_8px_#ffffff] hover:border-primary/30"
            )}
          >
            <p className="font-semibold text-text-primary">{option.label}</p>
            <p className="mt-1 text-sm text-text-secondary">{option.description}</p>
          </button>
        );
      })}
    </div>
  );
}
