"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { usePathname, useSearchParams } from "next/navigation";

const PROGRESS_INCREMENT_INTERVAL = 150;
const PROGRESS_INCREMENT_AMOUNT = 8;
const PROGRESS_MAX_PASSIVE = 90;
const PROGRESS_COMPLETE = 100;
const RESET_DELAY = 200;
const INITIAL_PROGRESS = 20;

export function NavigationProgress(): React.JSX.Element {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [progress, setProgress] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const [isNavigating, setIsNavigating] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const previousPathRef = useRef<string>("");

  const clearIntervalRef = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  const startProgress = useCallback(() => {
    clearIntervalRef();
    setIsNavigating(true);
    setIsVisible(true);
    setProgress(INITIAL_PROGRESS);

    intervalRef.current = setInterval(() => {
      setProgress((prev) => {
        if (prev >= PROGRESS_MAX_PASSIVE) {
          return prev + 0.5; // Slow down near the end
        }
        return Math.min(prev + PROGRESS_INCREMENT_AMOUNT, PROGRESS_MAX_PASSIVE);
      });
    }, PROGRESS_INCREMENT_INTERVAL);
  }, [clearIntervalRef]);

  const completeProgress = useCallback(() => {
    clearIntervalRef();
    setProgress(PROGRESS_COMPLETE);
    setIsNavigating(false);

    setTimeout(() => {
      setIsVisible(false);
      setProgress(0);
    }, RESET_DELAY);
  }, [clearIntervalRef]);

  // Track route changes and complete progress when route changes
  useEffect(() => {
    const currentPath = pathname + searchParams.toString();

    // On initial mount, store the path
    if (previousPathRef.current === "") {
      previousPathRef.current = currentPath;
      return;
    }

    // Route changed - complete the progress
    if (previousPathRef.current !== currentPath) {
      if (isNavigating) {
        completeProgress();
      }
      previousPathRef.current = currentPath;
    }

    return clearIntervalRef;
  }, [pathname, searchParams, isNavigating, completeProgress, clearIntervalRef]);

  // Listen for link clicks to start progress
  useEffect(() => {
    function handleClick(e: MouseEvent): void {
      const target = e.target as HTMLElement;
      const anchor = target.closest("a");

      if (!anchor) return;

      const href = anchor.getAttribute("href");
      if (!href) return;

      // Skip external links, hash links, downloads, and special protocols
      if (
        href.startsWith("http") ||
        href.startsWith("#") ||
        href.startsWith("mailto:") ||
        href.startsWith("tel:") ||
        anchor.hasAttribute("download") ||
        anchor.target === "_blank"
      ) {
        return;
      }

      // Start progress for internal navigation
      startProgress();
    }

    // Listen for browser back/forward navigation
    function handlePopState(): void {
      startProgress();
    }

    document.addEventListener("click", handleClick, true);
    window.addEventListener("popstate", handlePopState);

    return () => {
      document.removeEventListener("click", handleClick, true);
      window.removeEventListener("popstate", handlePopState);
    };
  }, [startProgress]);

  // Handle page load/refresh - show quick progress animation
  useEffect(() => {
    // Check if this is a fresh page load (not a client-side navigation)
    if (document.readyState === "loading") {
      setIsVisible(true);
      setProgress(30);

      const handleLoad = (): void => {
        setProgress(PROGRESS_COMPLETE);
        setTimeout(() => {
          setIsVisible(false);
          setProgress(0);
        }, RESET_DELAY);
      };

      window.addEventListener("load", handleLoad);
      return () => window.removeEventListener("load", handleLoad);
    } else if (document.readyState === "interactive") {
      // Page is loading, show progress
      setIsVisible(true);
      setProgress(60);

      setTimeout(() => {
        setProgress(PROGRESS_COMPLETE);
        setTimeout(() => {
          setIsVisible(false);
          setProgress(0);
        }, RESET_DELAY);
      }, 100);
    }
  }, []);

  return (
    <div
      className="navigation-progress-container"
      style={{ opacity: isVisible ? 1 : 0 }}
      role="progressbar"
      aria-valuenow={progress}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label="Page loading progress"
    >
      <div
        className="navigation-progress-bar"
        style={{
          width: `${progress}%`,
          transition: progress === 0 ? "none" : "width 0.2s ease-out"
        }}
      />
    </div>
  );
}
