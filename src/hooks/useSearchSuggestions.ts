"use client";

import { useEffect, useMemo, useState } from "react";
import {
  buildSuggestionSections,
  flattenSuggestionSections,
  type SuggestionItem,
  type SuggestionSection,
} from "@/lib/search-suggestions";

const DEBOUNCE_MS = 170;

export interface UseSearchSuggestionsOptions {
  rawQuery: string;
  isAuthenticated: boolean;
  recentSearches: string[];
}

export interface UseSearchSuggestionsResult {
  debouncedQuery: string;
  /** True while `rawQuery.trim()` has not yet been reflected in `debouncedQuery`. */
  isDebouncing: boolean;
  /** Grouped for list UI; total rows capped at 10 in builder. */
  sections: SuggestionSection[];
  /** Flat list in visual order for keyboard navigation. */
  flatItems: SuggestionItem[];
}

/**
 * Debounced query and client-side suggestion sections (skills, popular, recent).
 * Perceived latency: debounce window only—no network.
 */
export function useSearchSuggestions({
  rawQuery,
  isAuthenticated,
  recentSearches,
}: UseSearchSuggestionsOptions): UseSearchSuggestionsResult {
  const [debouncedQuery, setDebouncedQuery] = useState(() => rawQuery.trim());

  useEffect(() => {
    const trimmed = rawQuery.trim();
    if (trimmed === debouncedQuery) return;
    const id = window.setTimeout(() => setDebouncedQuery(trimmed), DEBOUNCE_MS);
    return () => window.clearTimeout(id);
  }, [rawQuery, debouncedQuery]);

  const isDebouncing = rawQuery.trim() !== debouncedQuery;

  const sections = useMemo(
    () =>
      buildSuggestionSections({
        debouncedQuery,
        recentSearches,
        showRecent: isAuthenticated,
      }),
    [debouncedQuery, recentSearches, isAuthenticated]
  );

  const flatItems = useMemo(() => flattenSuggestionSections(sections), [sections]);

  return {
    debouncedQuery,
    isDebouncing,
    sections,
    flatItems,
  };
}
