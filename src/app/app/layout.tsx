"use client";

import { useState } from "react";
import { cn } from "@/lib/cn";
import { Navbar } from "@/components/landing/Navbar";
import { AppSidebar } from "@/components/app-shell";

interface AppLayoutProps {
  children: React.ReactNode;
}

export default function AppLayout({ children }: AppLayoutProps): React.JSX.Element {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="app-no-scroll h-screen bg-background flex flex-col overflow-hidden">
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
          className={cn(
            "flex-1 p-4 lg:p-6 min-h-0 min-w-0",
            "overflow-hidden"
          )}
        >
          {children}
        </main>
      </div>
    </div>
  );
}
