import { useEffect, useRef, useState } from "react";

const DEFAULT_THRESHOLD = 80;

export function usePullToRefresh(
  onRefresh: () => void,
  threshold = DEFAULT_THRESHOLD,
  options: {
    scrollContainerId?: string;
    isRefreshing?: boolean;
    triggerOnMove?: boolean;
  } = {}
): { isPulling: boolean; pullDistance: number } {
  const [isPulling, setIsPulling] = useState(false);
  const [pullDistance, setPullDistance] = useState(0);
  const startYRef = useRef<number | null>(null);
  const didRefreshRef = useRef(false);

  useEffect(() => {
    function onTouchStart(e: TouchEvent): void {
      const scrollContainer = options.scrollContainerId
        ? document.getElementById(options.scrollContainerId)
        : null;
      const isAtTop = scrollContainer
        ? scrollContainer.scrollTop <= 0
        : window.scrollY === 0;

      if (isAtTop && !options.isRefreshing) {
        startYRef.current = e.touches[0].clientY;
        didRefreshRef.current = false;
      }
    }

    function onTouchMove(e: TouchEvent): void {
      if (startYRef.current === null || options.isRefreshing) return;
      const delta = e.touches[0].clientY - startYRef.current;
      if (delta > 0) {
        setPullDistance(Math.min(delta, threshold * 1.5));
        setIsPulling(delta >= threshold);
        if (options.triggerOnMove && delta >= threshold && !didRefreshRef.current) {
          didRefreshRef.current = true;
          onRefresh();
        }
      }
    }

    function onTouchEnd(): void {
      if (!options.triggerOnMove && isPulling && !options.isRefreshing) onRefresh();
      setIsPulling(false);
      setPullDistance(0);
      startYRef.current = null;
      didRefreshRef.current = false;
    }

    document.addEventListener("touchstart", onTouchStart, { passive: true });
    document.addEventListener("touchmove", onTouchMove, { passive: true });
    document.addEventListener("touchend", onTouchEnd);

    return () => {
      document.removeEventListener("touchstart", onTouchStart);
      document.removeEventListener("touchmove", onTouchMove);
      document.removeEventListener("touchend", onTouchEnd);
    };
  }, [isPulling, onRefresh, options.isRefreshing, options.scrollContainerId, options.triggerOnMove, threshold]);

  return { isPulling, pullDistance };
}
