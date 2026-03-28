"use client";

import { useCallback, useEffect, useId, useRef, useState, useMemo } from "react";
import { cn } from "@/lib/cn";
import { Icon, ICON_PATHS } from "@/components/ui/Icon";
import { useAuthStore } from "@/stores/auth-store";
import { useSearchSuggestions } from "@/hooks/useSearchSuggestions";
import { SearchSuggestions } from "@/components/search/SearchSuggestions";
import type { SuggestionItem } from "@/lib/search-suggestions";

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
  /** Called with the query to run (form submit or suggestion pick). */
  onSearch: (query: string) => void;
  placeholder?: string;
  className?: string;
}

/**
 * Primary search field with debounced autocomplete (skills, popular, recent when logged in),
 * keyboard navigation, and click-outside to close.
 */
export function SearchInput({
  value,
  onChange,
  onSearch,
  placeholder = "Search offers, services, and freelancers…",
  className,
}: SearchInputProps): React.JSX.Element {
  const listboxId = useId();
  const formRef = useRef<HTMLFormElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const [recentSnapshot, setRecentSnapshot] = useState<string[]>([]);
  const [inputFocused, setInputFocused] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);

  const refreshRecent = useCallback(() => {
    setRecentSnapshot(readRecentSearches());
  }, []);

  const { sections, flatItems, isDebouncing } = useSearchSuggestions({
    rawQuery: value,
    isAuthenticated,
    recentSearches: recentSnapshot,
  });

  const showPanel = inputFocused && (isDebouncing || flatItems.length > 0);

  const navIndex = useMemo(() => {
    if (activeIndex < 0 || flatItems.length === 0) return -1;
    return Math.min(activeIndex, flatItems.length - 1);
  }, [activeIndex, flatItems]);

  useEffect(() => {
    const onMouseDown = (e: MouseEvent) => {
      if (!formRef.current?.contains(e.target as Node)) {
        setInputFocused(false);
        setActiveIndex(-1);
      }
    };
    document.addEventListener("mousedown", onMouseDown);
    return () => document.removeEventListener("mousedown", onMouseDown);
  }, []);

  const applySuggestion = useCallback(
    (item: SuggestionItem) => {
      const q = item.text.trim();
      onChange(q);
      pushRecentSearch(q);
      refreshRecent();
      setActiveIndex(-1);
      setInputFocused(false);
      inputRef.current?.blur();
      onSearch(q);
    },
    [onChange, onSearch, refreshRecent]
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (navIndex >= 0 && flatItems[navIndex]) {
      applySuggestion(flatItems[navIndex]);
      return;
    }
    const q = value.trim();
    pushRecentSearch(q);
    refreshRecent();
    setInputFocused(false);
    onSearch(q);
  };

  const onInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Escape") {
      if (showPanel) {
        e.preventDefault();
        setInputFocused(false);
        setActiveIndex(-1);
      }
      return;
    }

    if (!flatItems.length && !isDebouncing) return;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      if (!flatItems.length) return;
      const len = flatItems.length;
      setActiveIndex((i) => {
        const clamped = i < 0 ? -1 : Math.min(i, len - 1);
        if (clamped < 0) return 0;
        return Math.min(clamped + 1, len - 1);
      });
      return;
    }

    if (e.key === "ArrowUp") {
      e.preventDefault();
      if (!flatItems.length) return;
      const len = flatItems.length;
      setActiveIndex((i) => {
        if (i < 0) return -1;
        const clamped = Math.min(i, len - 1);
        if (clamped <= 0) return -1;
        return clamped - 1;
      });
      return;
    }

    if (e.key === "Enter" && navIndex >= 0 && flatItems[navIndex]) {
      e.preventDefault();
      applySuggestion(flatItems[navIndex]);
    }
  };

  const activeOptionId =
    showPanel && navIndex >= 0 && flatItems[navIndex] ? flatItems[navIndex].id : undefined;

  return (
    <form ref={formRef} onSubmit={handleSubmit} className={cn("relative", className)}>
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
            ref={inputRef}
            type="search"
            value={value}
            onChange={(e) => {
              setActiveIndex(-1);
              onChange(e.target.value);
            }}
            onFocus={() => {
              refreshRecent();
              setInputFocused(true);
            }}
            onKeyDown={onInputKeyDown}
            placeholder={placeholder}
            className="flex-1 min-w-0 bg-transparent text-text-primary placeholder:text-text-secondary/60 outline-none text-base"
            aria-label="Search"
            aria-autocomplete="list"
            aria-expanded={showPanel}
            aria-controls={listboxId}
            aria-activedescendant={activeOptionId}
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

      {showPanel ? (
        <SearchSuggestions
          listboxId={listboxId}
          sections={sections}
          activeIndex={navIndex}
          isDebouncing={isDebouncing}
          onActiveIndexChange={setActiveIndex}
          onSelect={applySuggestion}
        />
      ) : null}
    </form>
  );
}
