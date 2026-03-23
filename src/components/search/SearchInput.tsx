"use client";

import { useCallback, useState } from "react";
import { cn } from "@/lib/cn";
import { Icon, ICON_PATHS } from "@/components/ui/Icon";

const RECENT_KEY = "offer-hub-recent-searches";
const MAX_RECENT = 8;

export function readRecentSearches(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(RECENT_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    return Array.isArray(parsed) ? parsed.filter((x): x is string => typeof x === "string") : [];
  } catch {
    return [];
  }
}

export function pushRecentSearch(query: string): void {
  const q = query.trim();
  if (!q || typeof window === "undefined") return;
  const prev = readRecentSearches().filter((s) => s.toLowerCase() !== q.toLowerCase());
  const next = [q, ...prev].slice(0, MAX_RECENT);
  localStorage.setItem(RECENT_KEY, JSON.stringify(next));
}

interface SearchInputProps {
  value: string;
  onChange: (value: string) => void;
  /** Called with the query to run (form submit or recent pick). */
  onSearch: (query: string) => void;
  placeholder?: string;
  className?: string;
}

/**
 * Primary search field with neumorphic styling, clear control, and recent suggestions.
 */
export function SearchInput({
  value,
  onChange,
  onSearch,
  placeholder = "Search offers, services, and freelancers…",
  className,
}: SearchInputProps): React.JSX.Element {
  const [recentOpen, setRecentOpen] = useState(false);
  const [recent, setRecent] = useState<string[]>([]);

  const refreshRecent = useCallback(() => {
    setRecent(readRecentSearches());
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const q = value.trim();
    pushRecentSearch(q);
    refreshRecent();
    setRecentOpen(false);
    onSearch(q);
  };

  return (
    <form onSubmit={handleSubmit} className={cn("relative", className)}>
      <div
        className={cn(
          "flex items-center gap-3 p-3 rounded-3xl bg-white",
          "shadow-[6px_6px_12px_#d1d5db,-6px_-6px_12px_#ffffff]"
        )}
      >
        <div
          className={cn(
            "flex-1 flex items-center gap-2 px-4 py-2.5 rounded-xl",
            "bg-background",
            "shadow-[inset_2px_2px_4px_#d1d5db,inset_-2px_-2px_4px_#ffffff]"
          )}
        >
          <Icon path={ICON_PATHS.search} size="md" className="text-text-secondary/60 shrink-0" />
          <input
            type="search"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onFocus={() => {
              setRecent(readRecentSearches());
              setRecentOpen(true);
            }}
            onBlur={() => setTimeout(() => setRecentOpen(false), 180)}
            placeholder={placeholder}
            className="flex-1 min-w-0 bg-transparent text-text-primary placeholder:text-text-secondary/60 outline-none text-base"
            aria-label="Search"
            autoComplete="off"
          />
          {value ? (
            <button
              type="button"
              onClick={() => onChange("")}
              className="shrink-0 text-sm text-text-secondary hover:text-text-primary px-2 py-1 rounded-lg hover:bg-white/60"
              aria-label="Clear search"
            >
              Clear
            </button>
          ) : null}
        </div>
        <button
          type="submit"
          className={cn(
            "shrink-0 px-6 py-2.5 rounded-xl font-medium text-white bg-primary",
            "shadow-[4px_4px_8px_#d1d5db,-2px_-2px_6px_#ffffff]",
            "hover:opacity-95 active:scale-[0.99] transition-all"
          )}
        >
          Search
        </button>
      </div>

      {recentOpen && recent.length > 0 && !value ? (
        <div
          className={cn(
            "absolute z-20 left-0 right-0 mt-2 p-2 rounded-2xl bg-white border border-black/5",
            "shadow-[6px_6px_16px_rgba(0,0,0,0.08)]"
          )}
        >
          <p className="px-2 py-1 text-xs font-medium text-text-secondary uppercase tracking-wide">
            Recent
          </p>
          <ul className="max-h-48 overflow-y-auto">
            {recent.map((r) => (
              <li key={r}>
                <button
                  type="button"
                  className="w-full text-left px-3 py-2 rounded-xl text-sm text-text-primary hover:bg-background"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => {
                    onChange(r);
                    pushRecentSearch(r);
                    refreshRecent();
                    setRecentOpen(false);
                    onSearch(r.trim());
                  }}
                >
                  {r}
                </button>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </form>
  );
}
