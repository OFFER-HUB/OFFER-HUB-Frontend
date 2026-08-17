"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { isNewUser } from "@/lib/auth/is-new-user";
import { useAuthStore } from "@/stores/auth-store";

interface OnboardingGuardProps {
  children: React.ReactNode;
}

export function OnboardingGuard({ children }: OnboardingGuardProps) {
  const router = useRouter();
  const hasHydrated = useAuthStore((state) => state.hasHydrated);
  const token = useAuthStore((state) => state.token);
  const user = useAuthStore((state) => state.user);

  const isAuthenticated = Boolean(token && user);
  const isComplete = user != null && !isNewUser(user);
  const canRender = hasHydrated && isAuthenticated && !isComplete;

  useEffect(() => {
    if (!hasHydrated) return;

    if (!isAuthenticated) {
      router.replace("/login");
      return;
    }

    if (isComplete) {
      router.replace("/app");
    }
  }, [hasHydrated, isAuthenticated, isComplete, router]);

  if (!canRender) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div
          className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent"
          aria-label="Loading"
        />
      </div>
    );
  }

  return <>{children}</>;
}
