"use client";

import { Icon, ICON_PATHS } from "@/components/ui/Icon";
import { cn } from "@/lib/cn";

export interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  onSearch: (e: React.FormEvent) => void;
  onClear: () => void;
  placeholder?: string;
  className?: string;
}

/**
 * Controlled marketplace search bar used by offers/services list pages.
 */
export function SearchBar({
  value,
  onChange,
  onSearch,
  onClear,
  placeholder = "Search...",
  className,
}: SearchBarProps): React.JSX.Element {
  return (
    <form onSubmit={onSearch} className={cn("max-w-4xl mb-6", className)}>
      <div
        className={cn(
          "flex items-center gap-3 p-3 rounded-3xl bg-white",
          "shadow-[6px_6px_14px_#d1d5db,-6px_-6px_14px_#ffffff]",
          "border border-white/80"
        )}
      >
        <div
          className={cn(
            "flex-1 flex items-center gap-3 px-5 py-3 rounded-2xl",
            "bg-background",
            "shadow-[inset_2px_2px_4px_#d1d5db,inset_-2px_-2px_4px_#ffffff]"
          )}
        >
          <Icon
            path={ICON_PATHS.search}
            size="sm"
            className="text-text-secondary/60 flex-shrink-0"
          />
          <input
            type="text"
            placeholder={placeholder}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="flex-1 bg-transparent text-sm text-text-primary placeholder-text-secondary/50 focus:outline-none"
          />
          {value ? (
            <button
              type="button"
              onClick={onClear}
              className="p-1 rounded-full text-text-secondary hover:text-text-primary hover:bg-gray-200 transition-colors"
              title="Clear search"
            >
              <Icon path={ICON_PATHS.close} size="sm" />
            </button>
          ) : null}
        </div>

        <button
          type="submit"
          className={cn(
            "px-7 py-3 rounded-2xl flex items-center gap-2 font-bold text-sm",
            "bg-primary text-white transition-all duration-200 cursor-pointer flex-shrink-0",
            "shadow-[4px_4px_8px_#d1d5db,-4px_-4px_8px_#ffffff]",
            "hover:bg-primary-hover hover:shadow-[5px_5px_10px_#d1d5db,-5px_-5px_10px_#ffffff]",
            "active:shadow-[inset_2px_2px_4px_rgba(0,0,0,0.2)]"
          )}
        >
          <span>Search</span>
        </button>
      </div>
    </form>
  );
}
