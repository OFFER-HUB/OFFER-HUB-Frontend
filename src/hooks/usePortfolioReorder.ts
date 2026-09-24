"use client";

import { useState } from "react";
import { reorderPortfolioItems } from "@/lib/api/portfolio";
import type { PortfolioItem } from "@/types/portfolio.types";

/**
 * Moves `dragId` so it sits directly before `targetId` in `items`.
 * Pure helper — exported for unit testing.
 */
export function buildReorderedIds(
  items: PortfolioItem[],
  dragId: string,
  targetId: string
): string[] {
  if (dragId === targetId) return items.map((item) => item.id);
  return items.reduce<string[]>((acc, item) => {
    if (item.id === targetId) {
      acc.push(dragId, item.id);
    } else if (item.id !== dragId) {
      acc.push(item.id);
    }
    return acc;
  }, []);
}

/** Swaps `index` with its neighbor and reindexes `order`. Pure helper for tests. */
function neighborSwap(items: PortfolioItem[], index: number, delta: -1 | 1): PortfolioItem[] {
  const next = [...items];
  [next[index], next[index + delta]] = [next[index + delta], next[index]];
  return next.map((item, i) => ({ ...item, order: i }));
}

export interface UsePortfolioReorderReturn {
  dragId: string | null;
  dragOverId: string | null;
  handleDragStart: (id: string) => void;
  handleDragOver: (e: React.DragEvent, id: string) => void;
  handleDrop: (e: React.DragEvent, targetId: string) => void;
  handleDragEnd: () => void;
  handleMoveUp: (index: number) => void;
  handleMoveDown: (index: number) => void;
}

interface UsePortfolioReorderOptions {
  items: PortfolioItem[];
  setItems: React.Dispatch<React.SetStateAction<PortfolioItem[]>>;
  token: string | null;
  /** Called after a successful drop so the page can show feedback. */
  onReorderSaved?: () => void;
}

/**
 * Owns the drag-and-drop reorder state for the portfolio grid:
 * drag tracking, array reordering, and persistence via `reorderPortfolioItems`.
 */
export function usePortfolioReorder({
  items,
  setItems,
  token,
  onReorderSaved,
}: UsePortfolioReorderOptions): UsePortfolioReorderReturn {
  const [dragId, setDragId] = useState<string | null>(null);
  const [dragOverId, setDragOverId] = useState<string | null>(null);

  function handleDragStart(id: string) {
    setDragId(id);
  }

  function handleDragOver(e: React.DragEvent, id: string) {
    e.preventDefault();
    if (id !== dragId) setDragOverId(id);
  }

  function handleDrop(e: React.DragEvent, targetId: string) {
    e.preventDefault();
    if (!dragId || dragId === targetId) {
      setDragId(null);
      setDragOverId(null);
      return;
    }

    setItems((prev) => {
      const fromIdx = prev.findIndex((p) => p.id === dragId);
      const toIdx = prev.findIndex((p) => p.id === targetId);
      if (fromIdx === -1 || toIdx === -1) return prev;
      const next = [...prev];
      const [moved] = next.splice(fromIdx, 1);
      next.splice(toIdx, 0, moved);
      return next.map((item, i) => ({ ...item, order: i }));
    });

    // Persist reorder (fire and forget in mock mode)
    const orderedIds = buildReorderedIds(items, dragId, targetId);
    reorderPortfolioItems(token, orderedIds).catch(console.error);

    setDragId(null);
    setDragOverId(null);
    onReorderSaved?.();
  }

  function handleDragEnd() {
    setDragId(null);
    setDragOverId(null);
  }

  function handleMoveUp(index: number) {
    if (index === 0) return;
    setItems((prev) => neighborSwap(prev, index, -1));
  }

  function handleMoveDown(index: number) {
    if (index === items.length - 1) return;
    setItems((prev) => neighborSwap(prev, index, 1));
  }

  return {
    dragId,
    dragOverId,
    handleDragStart,
    handleDragOver,
    handleDrop,
    handleDragEnd,
    handleMoveUp,
    handleMoveDown,
  };
}
