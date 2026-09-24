import { useSyncExternalStore } from "react";

const subscribe = () => () => {};

/**
 * False on every first render — server or client, full page load or a
 * client-side navigation Next re-renders on the server — then true from the
 * next render onward. The one hydration-safe way to gate on client-only
 * state (e.g. a Zustand store's `persist` rehydration) without a mismatch:
 * `useEffect(() => setState(true), [])` looks equivalent but still risks one
 * because `useSyncExternalStore` is what React itself uses internally to
 * guarantee the first client render matches the server, regardless of how
 * that render was produced.
 */
export function useHasMounted(): boolean {
  return useSyncExternalStore(
    subscribe,
    () => true,
    () => false
  );
}
