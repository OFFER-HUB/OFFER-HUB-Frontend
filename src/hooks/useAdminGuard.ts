"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/stores/auth-store";

export function useAdminGuard(): boolean {
  const router = useRouter();
  const { user, isAuthenticated, hasHydrated } = useAuthStore();
  const isAuthorized = hasHydrated && isAuthenticated && user !== null && user.type === "ADMIN";

  useEffect(() => {
    if (!hasHydrated) return;
    if (!isAuthenticated || user === null) {
      router.replace("/login");
      return;
    }
    if (user.type !== "ADMIN") {
      router.replace("/app/client/dashboard");
    }
  }, [user, isAuthenticated, hasHydrated, router]);

  return isAuthorized;
}
