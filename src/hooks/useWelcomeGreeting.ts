"use client";

import { useEffect, useSyncExternalStore } from "react";

const noopSubscribe = (): (() => void) => () => {};

/**
 * "Welcome" the first time a user opens their dashboard in this browser and
 * "Welcome back" on every later visit. The visit is recorded after the first
 * render, so the first greeting stays "Welcome" for the whole session.
 */
export function useWelcomeGreeting(userId: string | undefined): string {
  const key = userId ? `welcome-seen:${userId}` : null;

  const hasVisited = useSyncExternalStore(
    noopSubscribe,
    () => {
      if (!key) return true;
      try {
        return window.localStorage.getItem(key) === "1";
      } catch {
        return true;
      }
    },
    () => true,
  );

  useEffect(() => {
    if (!key) return;
    try {
      window.localStorage.setItem(key, "1");
    } catch {
      // Storage can be unavailable (private mode); the greeting then stays "Welcome back".
    }
  }, [key]);

  return hasVisited ? "Welcome back" : "Welcome";
}
