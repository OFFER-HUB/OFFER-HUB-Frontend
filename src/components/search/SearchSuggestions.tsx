"use client";

import { Fragment } from "react";
import { cn } from "@/lib/cn";
import { Icon, ICON_PATHS, LoadingSpinner } from "@/components/ui/Icon";
import { HighlightedText } from "@/components/search/HighlightedText";
import type { SuggestionItem, SuggestionSection } from "@/lib/search-suggestions";

function kindIcon(kind: SuggestionItem["kind"]): string {
  switch (kind) {
    case "recent":
      return ICON_PATHS.clock;
    case "popular":
      return ICON_PATHS.search;
    case "skill":
    default:
      return ICON_PATHS.briefcase;
  }
}

interface SearchSuggestionsProps {
  listboxId: string;
  sections: SuggestionSection[];
  activeIndex: number;
  isDebouncing: boolean;
  onActiveIndexChange: (index: number) => void;
  onSelect: (item: SuggestionItem) => void;
  className?: string;
}

/**
 * Autocomplete panel: sections, type icons, highlighted text, keyboard-active row.
 * Max 10 rows total enforced in buildSuggestionSections.
 */
export function SearchSuggestions({
  listboxId,
  sections,
  activeIndex,
  isDebouncing,
  onActiveIndexChange,
  onSelect,
  className,
}: SearchSuggestionsProps): React.JSX.Element {
  let flatRow = 0;

  return (
    <div
      id={listboxId}
      role="listbox"
      aria-label="Search suggestions"
      className={cn(
        "absolute z-30 left-0 right-0 mt-2 rounded-2xl bg-white border border-black/5",
        "shadow-[6px_6px_16px_rgba(0,0,0,0.08)] max-h-[min(420px,70vh)] overflow-y-auto overscroll-contain",
        className
      )}
    >
      {isDebouncing ? (
        <div
          className="flex items-center gap-2 px-3 py-2.5 border-b border-black/5 text-sm text-text-secondary"
          aria-live="polite"
        >
          <LoadingSpinner className="w-5 h-5 text-primary shrink-0" />
          <span>Loading suggestions…</span>
        </div>
      ) : null}
      {sections.map((section) => (
        <Fragment key={section.id}>
          <div
            role="presentation"
            className="px-3 pt-2 pb-1 text-xs font-medium text-text-secondary uppercase tracking-wide sticky top-0 bg-white/95 backdrop-blur-sm"
          >
            {section.title}
          </div>
          {section.items.map((item) => {
            const idx = flatRow++;
            const isActive = activeIndex === idx;
            return (
              <button
                key={item.id}
                type="button"
                role="option"
                id={item.id}
                aria-selected={isActive}
                title={item.text}
                onMouseDown={(e) => e.preventDefault()}
                onMouseEnter={() => onActiveIndexChange(idx)}
                onClick={() => onSelect(item)}
                className={cn(
                  "w-full flex items-center gap-3 px-3 py-2.5 text-left text-sm transition-colors rounded-lg mx-1",
                  isActive ? "bg-primary/10 text-text-primary" : "text-text-primary hover:bg-background"
                )}
              >
                <span
                  className={cn(
                    "shrink-0 w-9 h-9 rounded-xl flex items-center justify-center",
                    "bg-background shadow-[inset_2px_2px_4px_#d1d5db,inset_-2px_-2px_4px_#ffffff]",
                    isActive ? "text-primary" : "text-text-secondary"
                  )}
                >
                  <Icon path={kindIcon(item.kind)} size="sm" />
                </span>
                <span className="min-w-0 flex-1 truncate">
                  <HighlightedText text={item.text} query={item.highlightQuery} />
                </span>
              </button>
            );
          })}
        </Fragment>
      ))}
    </div>
  );
}
