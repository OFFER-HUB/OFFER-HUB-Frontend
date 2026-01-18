"use client";

import { useState } from "react";
import { cn } from "@/lib/cn";
import { Navbar } from "@/components/landing/Navbar";
import { AppSidebar } from "@/components/app-shell";

interface AppLayoutClientProps {
  children: React.ReactNode;
}

export function AppLayoutClient({ children }: AppLayoutClientProps): React.JSX.Element {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="app-no-scroll h-screen bg-background flex flex-col overflow-hidden">
      <a href="#main-content" className="skip-link">
        Skip to main content
      </a>

      <div className="flex-shrink-0">
        <Navbar />
      </div>

      <div className="flex flex-1 min-h-0">
        <div className="hidden lg:block flex-shrink-0">
          <AppSidebar
            isOpen={isSidebarOpen}
            onClose={() => setIsSidebarOpen(false)}
          />
        </div>

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
