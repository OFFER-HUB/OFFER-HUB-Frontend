"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/stores/auth-store";

/**
 * Client-side gate for `/admin/*` pages.
 *
 * Waits for the persisted session to rehydrate before deciding — on a hard
 * reload `user` is null until then, and redirecting on that would bounce a real
 * admin to `/login`. Signed-out visitors go to `/login`; signed-in non-admins go
 * back to their dashboard. `user.type` is the marketplace role and never grants
 * access; only the JWT's `isAdmin` claim (mirrored onto `user.isAdmin`) does.
 * The backend `AdminAuthGuard` is the real authority — this only keeps
 * non-admins from seeing an admin page that would 403 anyway.
 */
export function useAdminGuard(): boolean {
  const router = useRouter();
  const { user, isAuthenticated, hasHydrated } = useAuthStore();
  const isSignedIn = hasHydrated && isAuthenticated && user !== null;
  const isAuthorized = isSignedIn && user.isAdmin === true;

  useEffect(() => {
    if (!hasHydrated) return;
    if (!isSignedIn) {
      router.replace("/login");
      return;
    }
    if (!isAuthorized) {
      router.replace("/app/client/dashboard");
    }
  }, [hasHydrated, isSignedIn, isAuthorized, router]);

  return isAuthorized;
}
