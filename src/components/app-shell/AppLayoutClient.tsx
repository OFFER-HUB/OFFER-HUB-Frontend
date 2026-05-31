"use client";

import { useState } from "react";
import { cn } from "@/lib/cn";
import { AppHeader, AppSidebar } from "@/components/app-shell";
import { OnboardingTour } from "@/components/onboarding";
import { NotificationToastContainer } from "@/components/notifications/NotificationToastContainer";

interface AppLayoutClientProps {
  children: React.ReactNode;
}

export function AppLayoutClient({ children }: AppLayoutClientProps): React.JSX.Element {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

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
            "flex-1 p-4 lg:p-6 min-h-0 min-w-0",
            "app-main-content"
          )}
          role="main"
          aria-label="Main content"
        >
          {children}
        </main>
      </div>
    </div>
  );
}