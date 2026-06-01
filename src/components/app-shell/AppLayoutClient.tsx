"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/cn";
import { AppHeader, AppSidebar } from "@/components/app-shell";
import { OnboardingTour } from "@/components/onboarding";
import { NotificationToastContainer } from "@/components/notifications/NotificationToastContainer";
import { EmailVerificationBanner } from "@/components/auth/EmailVerificationBanner";
import { useAuthStore } from "@/stores/auth-store";
import { sendVerification } from "@/lib/api/auth";

interface AppLayoutClientProps {
  children: React.ReactNode;
}

export function AppLayoutClient({ children }: AppLayoutClientProps): React.JSX.Element {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const pathname = usePathname();

  const user = useAuthStore((state) => state.user);
  const token = useAuthStore((state) => state.token);

  const isDashboardPage = pathname?.endsWith("/dashboard");

  const handleResendVerification = async () => {
    if (token) {
      await sendVerification(token);
    }
  };

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
          {children}
        </main>
      </div>
    </div>
  );
}