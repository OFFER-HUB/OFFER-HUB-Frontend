"use client";

import { useEffect } from "react";
import { SessionProvider } from "next-auth/react";
import { useAuthStore } from "@/stores/auth-store";

interface AuthProviderProps {
  children: React.ReactNode;
}

/**
 * Wraps the app in the NextAuth session (used only as the OAuth broker) and
 * restores the persisted backend session once on mount.
 *
 * The store is created with `skipHydration`, so this effect is what actually
 * reads localStorage. Doing it here — after the first client render has matched
 * the server HTML — is what makes a signed-in session survive a page reload.
 */
export function AuthProvider({ children }: AuthProviderProps) {
  useEffect(() => {
    let cancelled = false;

    void Promise.resolve(useAuthStore.persist.rehydrate()).finally(() => {
      // Flip the flag even when nothing was stored, otherwise signed-out users
      // would wait on a hydration that never reports back.
      if (!cancelled) {
        useAuthStore.getState().setHasHydrated(true);
      }
    });

    return () => {
      cancelled = true;
    };
  }, []);

  return <SessionProvider>{children}</SessionProvider>;
}
