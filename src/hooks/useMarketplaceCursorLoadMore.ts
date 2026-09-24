"use client";

import { useCallback, useState } from "react";

export interface CursorPage<T> {
  data: T[];
  hasMore: boolean;
  nextCursor?: string;
}

interface UseMarketplaceCursorLoadMoreOptions<T> {
  hasMore: boolean;
  nextCursor: string | undefined;
  fetchPage: (cursor: string) => Promise<CursorPage<T>>;
  onAppend: (items: T[]) => void;
  onMetaChange: (meta: { hasMore: boolean; nextCursor?: string }) => void;
  errorMessage?: string;
}

/**
 * Shared cursor pagination "load more" handler for marketplace list pages.
 */
export function useMarketplaceCursorLoadMore<T>({
  hasMore,
  nextCursor,
  fetchPage,
  onAppend,
  onMetaChange,
  errorMessage = "Failed to load more",
}: UseMarketplaceCursorLoadMoreOptions<T>): {
  loadMore: () => Promise<void>;
  isLoadingMore: boolean;
} {
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  const loadMore = useCallback(async () => {
    if (!hasMore || !nextCursor || isLoadingMore) return;

    setIsLoadingMore(true);
    try {
      const response = await fetchPage(nextCursor);
      onAppend(response.data);
      onMetaChange({ hasMore: response.hasMore, nextCursor: response.nextCursor });
    } catch (err) {
      console.error(errorMessage, err);
    } finally {
      setIsLoadingMore(false);
    }
  }, [
    hasMore,
    nextCursor,
    isLoadingMore,
    fetchPage,
    onAppend,
    onMetaChange,
    errorMessage,
  ]);

  return { loadMore, isLoadingMore };
}
