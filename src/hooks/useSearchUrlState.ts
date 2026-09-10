"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import type { SearchTab, SearchSort } from "@/lib/api/search";
import type { ResultsViewMode, SearchFiltersState } from "@/components/search";

const PRICE_CAP = 10000;

function parseTab(raw: string | null): SearchTab {
  if (raw === "services" || raw === "freelancers") return raw;
  return "offers";
}

function parseSort(raw: string | null): SearchSort {
  if (raw === "price" || raw === "rating" || raw === "date" || raw === "relevance") return raw;
  return "relevance";
}

function parseView(raw: string | null): ResultsViewMode {
  return raw === "list" ? "list" : "grid";
}

export interface SearchUrlState {
  q: string;
  tab: SearchTab;
  sort: SearchSort;
  viewMode: ResultsViewMode;
  category: string;
  minPrice: number;
  maxPrice: number;
  minRating: number;
  skills: Set<string>;
  draftQ: string;
  setDraftQ: (v: string) => void;
  filtersForSidebar: SearchFiltersState;
  setParams: (updates: Record<string, string | null>) => void;
  handleFiltersChange: (next: SearchFiltersState) => void;
  handleClearAllFilters: () => void;
}

export function useSearchUrlState(): SearchUrlState {
  const sp = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const q = sp.get("q") ?? "";
  const tab = parseTab(sp.get("tab"));
  const sort = parseSort(sp.get("sort"));
  const viewMode = parseView(sp.get("view"));
  const category = sp.get("category") ?? "";
  const minPrice = Math.max(0, Number(sp.get("minPrice")) || 0);
  const maxPriceRaw = sp.get("maxPrice");
  const maxPrice =
    maxPriceRaw === null || maxPriceRaw === ""
      ? PRICE_CAP
      : Math.min(PRICE_CAP, Math.max(0, Number(maxPriceRaw) || PRICE_CAP));
  const minRating = Math.min(5, Math.max(0, Number(sp.get("minRating")) || 0));
  const skills = useMemo(
    () => new Set((sp.get("skills") ?? "").split(",").filter(Boolean)),
    [sp]
  );

  const [draftQ, setDraftQ] = useState(q);
  useEffect(() => {
    setDraftQ(q);
  }, [q]);

  const setParams = useCallback(
    (updates: Record<string, string | null>) => {
      const next = new URLSearchParams(sp.toString());
      for (const [key, value] of Object.entries(updates)) {
        if (value === null || value === "") next.delete(key);
        else next.set(key, value);
      }
      router.replace(`${pathname}?${next.toString()}`, { scroll: false });
    },
    [sp, router, pathname]
  );

  const filtersForSidebar: SearchFiltersState = { category, minPrice, maxPrice, minRating, skills };

  const handleFiltersChange = useCallback(
    (next: SearchFiltersState) => {
      setParams({
        category: next.category || null,
        minPrice: next.minPrice > 0 ? String(next.minPrice) : null,
        maxPrice: next.maxPrice < PRICE_CAP ? String(next.maxPrice) : null,
        minRating: next.minRating > 0 ? String(next.minRating) : null,
        skills: next.skills.size > 0 ? [...next.skills].join(",") : null,
      });
    },
    [setParams]
  );

  const handleClearAllFilters = useCallback(() => {
    setParams({ category: null, minPrice: null, maxPrice: null, minRating: null, skills: null });
  }, [setParams]);

  return {
    q,
    tab,
    sort,
    viewMode,
    category,
    minPrice,
    maxPrice,
    minRating,
    skills,
    draftQ,
    setDraftQ,
    filtersForSidebar,
    setParams,
    handleFiltersChange,
    handleClearAllFilters,
  };
}
