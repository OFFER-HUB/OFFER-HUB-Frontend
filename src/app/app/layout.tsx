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
      <Navbar />

      {/* Content area below navbar */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar - Only visible on lg screens, hidden on mobile */}
        <div className="hidden lg:block">
          <AppSidebar
            isOpen={isSidebarOpen}
            onClose={() => setIsSidebarOpen(false)}
          />
        </div>

        {/* Main Content */}
        <main
          className={cn(
            "flex-1 p-4 lg:p-6",
            "overflow-y-auto"
          )}
        >
          {children}
        </main>
      </div>
    </div>
  );
}
