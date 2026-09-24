"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/cn";
import { AppHeader, AppSidebar } from "@/components/app-shell";
import { OnboardingTour } from "@/components/onboarding";
import { NotificationToastContainer } from "@/components/notifications/NotificationToastContainer";
import { EmailVerificationBanner } from "@/components/auth/EmailVerificationBanner";
import { WalletConnectionBanner } from "@/components/wallet/WalletConnectionBanner";
import { useAuthStore } from "@/stores/auth-store";
import { isNewUser } from "@/lib/auth/is-new-user";
import { sendVerification } from "@/lib/api/auth";
import { useHasMounted } from "@/hooks/use-has-mounted";

interface AppLayoutClientProps {
  children: React.ReactNode;
}

export function AppLayoutClient({ children }: AppLayoutClientProps): React.JSX.Element {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  const hasHydrated = useAuthStore((state) => state.hasHydrated);
  const user = useAuthStore((state) => state.user);
  const token = useAuthStore((state) => state.token);

  const isAuthenticated = Boolean(token && user);
  const needsOnboarding = user != null && isNewUser(user);
  // Whether it's safe to show the dashboard at all — false while we're about
  // to redirect away from it. Rendering `children` unconditionally here (the
  // redirect used to be a side effect with no corresponding gate) let an
  // incomplete/logged-out user see a flash of real dashboard content for one
  // frame before the effect below kicked in.
  // `hasHydrated` starts false identically on server and client, so reading
  // it alone can't cause a mismatch. But Next's App Router can re-render this
  // layout on the server for a fresh navigation while the client's Zustand
  // store is already hydrated from an earlier page in the same session — the
  // server then computes canRenderApp from a cold `hasHydrated: false` while
  // the client computes it from the real (already-true) value, and React
  // throws the whole subtree away and repaints once it notices. `mounted` is
  // false on every first render, server or client, however it got here — the
  // one value Next can always reuse without a mismatch.
  const mounted = useHasMounted();

  const canRenderApp = mounted && hasHydrated && isAuthenticated && !needsOnboarding;

  useEffect(() => {
    if (!hasHydrated) return;
    if (!isAuthenticated) {
      router.replace("/login");
      return;
    }
    if (needsOnboarding) {
      router.replace("/onboarding");
    }
  }, [hasHydrated, isAuthenticated, needsOnboarding, router]);

  const isDashboardPage = pathname?.endsWith("/dashboard");
  // #362: the wallet reminder also belongs on the profile page, not just the
  // dashboard — a walletless profile is exactly the "incomplete" state it's
  // there to nudge the user out of.
  const isProfilePage = pathname?.endsWith("/profile");

  const handleResendVerification = async () => {
    if (token) {
      await sendVerification(token);
    }
  };

  if (!canRenderApp) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div
          className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent"
          aria-label="Loading"
        />
      </div>
    );
  }

  return (
    <div className="app-no-scroll h-screen bg-background flex flex-col overflow-hidden">
      <OnboardingTour />
      <NotificationToastContainer />

      <a href="#main-content" className="skip-link">
        Skip to main content
      </a>

      <div className="flex-shrink-0">
        <AppHeader onMenuClick={() => setIsSidebarOpen((prev) => !prev)} />
      </div>

      <div className="flex flex-1 min-h-0 relative">
        {/* Mobile Sidebar Backdrop Overlay */}
        {isSidebarOpen && (
          <div
            className="fixed inset-0 bg-black/50 z-40 lg:hidden backdrop-blur-xs"
            onClick={() => setIsSidebarOpen(false)}
          />
        )}

        <AppSidebar
          isOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
        />

        <main
          id="main-content"
          className={cn(
            "flex-1 p-4 lg:p-6 min-h-0 min-w-0 flex flex-col gap-4",
            "app-main-content"
          )}
          role="main"
          aria-label="Main content"
        >
          {isDashboardPage && user && (
            <EmailVerificationBanner
              userId={user.id}
              email={user.email}
              isVerified={user.isEmailVerified}
              onResend={handleResendVerification}
            />
          )}
          {(isDashboardPage || isProfilePage) && user && (
            <WalletConnectionBanner userId={user.id} hasWallet={user.wallet != null} />
          )}
          {children}
        </main>
      </div>
    </div>
  );
}