import { useEffect, useRef, useState } from "react";

const DEFAULT_THRESHOLD = 80;

interface UsePullToRefreshOptions {
  containerId?: string;
  threshold?: number;
  isRefreshing?: boolean;
}

export function usePullToRefresh(
  onRefresh: () => void,
  { containerId, threshold = DEFAULT_THRESHOLD, isRefreshing = false }: UsePullToRefreshOptions = {}
): { isPulling: boolean; pullDistance: number } {
  const [isPulling, setIsPulling] = useState(false);
  const [pullDistance, setPullDistance] = useState(0);
  const startYRef = useRef(0);
  const isPullingRef = useRef(false);

  useEffect(() => {
    const container = containerId ? document.getElementById(containerId) : null;
    const target = container ?? document;

    function onTouchStart(event: Event): void {
      const touchEvent = event as TouchEvent;
      const isAtTop = container ? container.scrollTop <= 0 : window.scrollY === 0;
      if (isAtTop && !isRefreshing) {
        startYRef.current = touchEvent.touches[0].clientY;
      }
    }

    function onTouchMove(event: Event): void {
      const touchEvent = event as TouchEvent;
      if (startYRef.current === 0) return;
      const delta = touchEvent.touches[0].clientY - startYRef.current;
      if (delta > 0) {
        setPullDistance(Math.min(delta, threshold * 1.5));
        const pulling = delta >= threshold;
        isPullingRef.current = pulling;
        setIsPulling(pulling);
      }
    }

    function onTouchEnd(): void {
      if (isPullingRef.current && !isRefreshing) onRefresh();
      isPullingRef.current = false;
      setIsPulling(false);
      setPullDistance(0);
      startYRef.current = 0;
    }

    target.addEventListener("touchstart", onTouchStart, { passive: true });
    target.addEventListener("touchmove", onTouchMove, { passive: true });
    target.addEventListener("touchend", onTouchEnd);
    target.addEventListener("touchcancel", onTouchEnd);

    return () => {
      target.removeEventListener("touchstart", onTouchStart);
      target.removeEventListener("touchmove", onTouchMove);
      target.removeEventListener("touchend", onTouchEnd);
      target.removeEventListener("touchcancel", onTouchEnd);
    };
  }, [containerId, isRefreshing, onRefresh, threshold]);

  return { isPulling, pullDistance };
}
