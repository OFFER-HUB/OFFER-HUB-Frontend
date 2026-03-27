import { SEARCH_SKILL_OPTIONS } from "@/lib/api/search";
import { POPULAR_SEARCHES } from "@/data/popular-searches";

export type SuggestionKind = "recent" | "popular" | "skill";

export interface SuggestionItem {
  id: string;
  kind: SuggestionKind;
  /** Value submitted to search (human-readable query). */
  text: string;
  /** Substring highlighting in the UI (typically debounced query). */
  highlightQuery: string;
}

const MAX_SUGGESTIONS = 10;

export function normalizeSuggestQuery(q: string): string {
  return q.trim().toLowerCase();
}

/** Returns 0 = no match, higher = better. Caps string lengths for fuzzy path. */
export function matchScore(haystack: string, needle: string): number {
  const h = normalizeSuggestQuery(haystack);
  const n = normalizeSuggestQuery(needle);
  if (!n) return 0;
  if (h === n) return 100;
  if (h.startsWith(n)) return 80;
  if (h.includes(n)) return 50;
  if (h.length <= 22 && n.length <= 22 && levenshteinAtMost1(h, n)) return 25;
  return 0;
}

function levenshteinAtMost1(a: string, b: string): boolean {
  if (a === b) return true;
  if (Math.abs(a.length - b.length) > 1) return false;
  let i = 0;
  let j = 0;
  let edits = 0;
  while (i < a.length && j < b.length) {
    if (a[i] === b[j]) {
      i++;
      j++;
      continue;
    }
    edits++;
    if (edits > 1) return false;
    if (a.length > b.length) {
      i++;
    } else if (a.length < b.length) {
      j++;
    } else {
      i++;
      j++;
    }
  }
  if (i < a.length || j < b.length) edits++;
  return edits <= 1;
}

export interface SuggestionSection {
  id: string;
  title: string;
  items: SuggestionItem[];
}

function dedupeByText(items: SuggestionItem[]): SuggestionItem[] {
  const seen = new Set<string>();
  const out: SuggestionItem[] = [];
  for (const it of items) {
    const k = it.text.toLowerCase();
    if (seen.has(k)) continue;
    seen.add(k);
    out.push(it);
  }
  return out;
}

function capTotal(sections: SuggestionSection[], maxTotal: number): SuggestionSection[] {
  let remaining = maxTotal;
  return sections
    .map((s) => {
      const take = Math.min(s.items.length, remaining);
      remaining -= take;
      return { ...s, items: s.items.slice(0, take) };
    })
    .filter((s) => s.items.length > 0);
}

/**
 * Builds suggestion sections. Max 10 suggestion rows total across all sections.
 * - Empty query: Recent (optional) + Popular.
 * - Non-empty: ranked skills + matching popular.
 */
export function buildSuggestionSections(params: {
  debouncedQuery: string;
  recentSearches: string[];
  showRecent: boolean;
}): SuggestionSection[] {
  const q = params.debouncedQuery.trim();
  const hi = q;

  if (!q) {
    const recentItems: SuggestionItem[] = params.showRecent
      ? params.recentSearches.map((text, i) => ({
          id: `recent-${i}-${text.slice(0, 24)}`,
          kind: "recent" as const,
          text,
          highlightQuery: "",
        }))
      : [];

    const popularItems: SuggestionItem[] = POPULAR_SEARCHES.map((text, i) => ({
      id: `popular-${i}-${text}`,
      kind: "popular" as const,
      text,
      highlightQuery: "",
    }));

    const sections: SuggestionSection[] = [];
    if (recentItems.length) {
      sections.push({ id: "recent", title: "Recent", items: recentItems });
    }
    sections.push({ id: "popular", title: "Popular", items: popularItems });
    return capTotal(sections, MAX_SUGGESTIONS);
  }

  const scored: Array<{ text: string; kind: SuggestionKind; score: number }> = [];

  for (const opt of SEARCH_SKILL_OPTIONS) {
    const label = opt.label;
    const sLabel = matchScore(label, q);
    const sVal = matchScore(opt.value.replace(/_/g, " "), q);
    const score = Math.max(sLabel, sVal);
    if (score > 0) {
      scored.push({ text: label, kind: "skill", score });
    }
  }

  for (const p of POPULAR_SEARCHES) {
    const score = matchScore(p, q);
    if (score > 0) {
      scored.push({ text: p, kind: "popular", score });
    }
  }

  scored.sort((a, b) => b.score - a.score);

  const skillPopularItems: SuggestionItem[] = dedupeByText(
    scored.map((s, i) => ({
      id: `${s.kind}-${i}-${s.text}`,
      kind: s.kind,
      text: s.text,
      highlightQuery: hi,
    }))
  ).slice(0, MAX_SUGGESTIONS);

  return skillPopularItems.length
    ? [{ id: "matches", title: "Suggestions", items: skillPopularItems }]
    : [];
}

export function flattenSuggestionSections(sections: SuggestionSection[]): SuggestionItem[] {
  return sections.flatMap((s) => s.items);
}
