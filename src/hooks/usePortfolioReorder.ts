import { useState, useCallback } from "react";
import { reorderPortfolioItems } from "@/lib/api/portfolio";
import type { PortfolioItem } from "@/types/portfolio.types";

export interface UsePortfolioReorderOptions {
  items: PortfolioItem[];
  setItems: React.Dispatch<React.SetStateAction<PortfolioItem[]>>;
  token: string | null;
  onSuccess?: (message: string) => void;
}

export interface UsePortfolioReorderReturn {
  dragId: string | null;
  dragOverId: string | null;
  handleMoveUp: (index: number) => void;
  handleMoveDown: (index: number) => void;
  handleDragStart: (id: string) => void;
  handleDragOver: (e: React.DragEvent, id: string) => void;
  handleDrop: (e: React.DragEvent, targetId: string) => void;
  handleDragEnd: () => void;
}

export function usePortfolioReorder({
  items,
  setItems,
  token,
  onSuccess,
}: UsePortfolioReorderOptions): UsePortfolioReorderReturn {
  const [dragId, setDragId] = useState<string | null>(null);
  const [dragOverId, setDragOverId] = useState<string | null>(null);

  const handleMoveUp = useCallback((index: number) => {
    if (index === 0) return;
    setItems((prev) => {
      const next = [...prev];
      [next[index - 1], next[index]] = [next[index], next[index - 1]];
      return next.map((item, i) => ({ ...item, order: i }));
    });
  }, [setItems]);

  const handleMoveDown = useCallback((index: number) => {
    if (index === items.length - 1) return;
    setItems((prev) => {
      const next = [...prev];
      [next[index], next[index + 1]] = [next[index + 1], next[index]];
      return next.map((item, i) => ({ ...item, order: i }));
    });
  }, [items.length, setItems]);

  const handleDragStart = useCallback((id: string) => {
    setDragId(id);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent, id: string) => {
    e.preventDefault();
    if (id !== dragId) {
      setDragOverId(id);
    }
  }, [dragId]);

  const handleDrop = useCallback((e: React.DragEvent, targetId: string) => {
    e.preventDefault();
    if (!dragId || dragId === targetId) {
      setDragId(null);
      setDragOverId(null);
      return;
    }

    setItems((prev) => {
      const next = [...prev];
      const fromIdx = next.findIndex((p) => p.id === dragId);
      const toIdx = next.findIndex((p) => p.id === targetId);
      if (fromIdx === -1 || toIdx === -1) return prev;
      const [moved] = next.splice(fromIdx, 1);
      next.splice(toIdx, 0, moved);
      return next.map((item, i) => ({ ...item, order: i }));
    });

    const orderedIds = items
      .filter((p) => p.id !== dragId)
      .reduce<string[]>((acc, p) => {
        if (p.id === targetId) {
          acc.push(dragId, p.id);
        } else {
          acc.push(p.id);
        }
        return acc;
      }, []);

    reorderPortfolioItems(token, orderedIds).catch(console.error);

    setDragId(null);
    setDragOverId(null);
    onSuccess?.("Order saved.");
  }, [dragId, items, onSuccess, setItems, token]);

  const handleDragEnd = useCallback(() => {
    setDragId(null);
    setDragOverId(null);
  }, []);

  return {
    dragId,
    dragOverId,
    handleMoveUp,
    handleMoveDown,
    handleDragStart,
    handleDragOver,
    handleDrop,
    handleDragEnd,
  };
}
