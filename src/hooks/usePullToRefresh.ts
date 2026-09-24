import { useEffect, useRef, useState } from "react";

const DEFAULT_THRESHOLD = 80;

export function usePullToRefresh(
  onRefresh: () => void,
  threshold = DEFAULT_THRESHOLD
): { isPulling: boolean; pullDistance: number } {
  const [isPulling, setIsPulling] = useState(false);
  const [pullDistance, setPullDistance] = useState(0);
  const startYRef = useRef(0);

  useEffect(() => {
    function onTouchStart(e: TouchEvent): void {
      if (window.scrollY === 0) {
        startYRef.current = e.touches[0].clientY;
      }
    }

    function onTouchMove(e: TouchEvent): void {
      if (startYRef.current === 0) return;
      const delta = e.touches[0].clientY - startYRef.current;
      if (delta > 0) {
        setPullDistance(Math.min(delta, threshold * 1.5));
        setIsPulling(delta >= threshold);
      }
    }

    function onTouchEnd(): void {
      if (isPulling) onRefresh();
      setIsPulling(false);
      setPullDistance(0);
      startYRef.current = 0;
    }

    document.addEventListener("touchstart", onTouchStart, { passive: true });
    document.addEventListener("touchmove", onTouchMove, { passive: true });
    document.addEventListener("touchend", onTouchEnd);

    return () => {
      document.removeEventListener("touchstart", onTouchStart);
      document.removeEventListener("touchmove", onTouchMove);
      document.removeEventListener("touchend", onTouchEnd);
    };
  }, [isPulling, onRefresh, threshold]);

  return { isPulling, pullDistance };
}
