"use client";

import { useState } from "react";
import { cn } from "@/lib/cn";
import { AppSidebar, AppHeader } from "@/components/app-shell";

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background">
      <div className="flex">
        {/* Sidebar */}
        <AppSidebar
          isOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
        />

        {/* Main Content */}
        <div className="flex-1 flex flex-col min-h-screen lg:ml-0">
          {/* Header */}
          <AppHeader onMenuClick={() => setIsSidebarOpen(true)} />

          {/* Page Content */}
          <main
            className={cn(
              "flex-1 p-4 lg:p-6",
              "overflow-auto"
            )}
          >
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}
