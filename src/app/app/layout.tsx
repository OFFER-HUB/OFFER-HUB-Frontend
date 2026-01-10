"use client";

import { useState } from "react";
import { cn } from "@/lib/cn";
import { Navbar } from "@/components/landing/Navbar";
import { AppSidebar } from "@/components/app-shell";

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Navbar - Same as landing/marketplace */}
      <div className="flex-shrink-0">
        <Navbar />
      </div>

      {/* Content area below navbar */}
      <div className="flex flex-1 min-h-0">
        {/* Sidebar - Only visible on lg screens, hidden on mobile */}
        <div className="hidden lg:block flex-shrink-0">
          <AppSidebar
            isOpen={isSidebarOpen}
            onClose={() => setIsSidebarOpen(false)}
          />
        </div>

        {/* Main Content */}
        <main
          className={cn(
            "flex-1 p-4 lg:p-6 min-h-0 min-w-0",
            "overflow-auto"
          )}
        >
          {children}
        </main>
      </div>
    </div>
  );
}
