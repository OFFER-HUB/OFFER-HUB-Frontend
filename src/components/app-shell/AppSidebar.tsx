"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/cn";
import { Icon, ICON_PATHS } from "@/components/ui/Icon";
import { useModeStore, getNavigationItems, type UserMode } from "@/stores/mode-store";
import { useSidebarStore } from "@/stores/sidebar-store";

interface AppSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const MODE_TOGGLE_BASE = cn(
  "flex-1 py-2 px-3 rounded-lg text-sm font-medium",
  "transition-all duration-200 cursor-pointer"
);

const MODE_TOGGLE_ACTIVE = "bg-primary text-white shadow-[2px_2px_4px_#d1d5db,-2px_-2px_4px_#ffffff]";
const MODE_TOGGLE_INACTIVE = "text-text-secondary hover:text-text-primary";

const NAV_LINK_BASE = cn(
  "flex items-center gap-3 px-4 py-3 rounded-xl",
  "transition-all duration-200"
);

const NAV_LINK_COLLAPSED = cn(
  "flex items-center justify-center p-3 rounded-xl",
  "transition-all duration-200"
);

const NAV_LINK_ACTIVE =
  "bg-primary text-white shadow-[4px_4px_8px_#d1d5db,-4px_-4px_8px_#ffffff]";
const NAV_LINK_INACTIVE =
  "text-text-secondary hover:bg-background hover:text-text-primary hover:shadow-[4px_4px_8px_#d1d5db,-4px_-4px_8px_#ffffff]";

const MODE_LABELS: Record<UserMode, string> = {
  freelancer: "Finding work",
  client: "Hiring talent",
};

function getModeToggleStyles(isActive: boolean): string {
  return cn(MODE_TOGGLE_BASE, isActive ? MODE_TOGGLE_ACTIVE : MODE_TOGGLE_INACTIVE);
}

function getNavLinkStyles(isActive: boolean, isCollapsed: boolean): string {
  const base = isCollapsed ? NAV_LINK_COLLAPSED : NAV_LINK_BASE;
  return cn(base, isActive ? NAV_LINK_ACTIVE : NAV_LINK_INACTIVE);
}

export function AppSidebar(_props: AppSidebarProps): React.JSX.Element {
  const pathname = usePathname();
  const { mode, setMode } = useModeStore();
  const { isCollapsed, toggleCollapsed } = useSidebarStore();
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setHydrated(true);
  }, []);

  const navItems = getNavigationItems(mode);

  function isActiveLink(href: string): boolean {
    return pathname === href || pathname.startsWith(href + "/");
  }

  function handleModeChange(newMode: UserMode): void {
    setMode(newMode);
  }

  return (
    <aside
      className={cn(
        "m-6 mr-0",
        "bg-white rounded-2xl",
        "shadow-[6px_6px_12px_#d1d5db,-6px_-6px_12px_#ffffff]",
        "flex-shrink-0",
        "flex flex-col",
        "transition-all duration-300 ease-in-out",
        "hidden lg:flex",
        isCollapsed ? "w-20" : "w-64"
      )}
    >
      {/* Collapse Toggle Button */}
      <div className={cn("p-3", isCollapsed ? "flex justify-center" : "flex justify-end")}>
        <button
          type="button"
          onClick={toggleCollapsed}
          className={cn(
            "p-2 rounded-lg cursor-pointer",
            "text-text-secondary hover:text-text-primary",
            "hover:bg-background",
            "transition-all duration-200"
          )}
          title={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          <Icon
            path={isCollapsed ? ICON_PATHS.chevronRight : ICON_PATHS.chevronLeft}
            size="sm"
          />
        </button>
      </div>

      {/* Mode Toggle - Only show when expanded */}
      {!isCollapsed && (
        <>
          <div className="px-4 pb-2">
            <div
              className={cn(
                "p-2 rounded-xl",
                "bg-background",
                "shadow-[inset_2px_2px_4px_#d1d5db,inset_-2px_-2px_4px_#ffffff]"
              )}
            >
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => handleModeChange("freelancer")}
                  className={getModeToggleStyles(hydrated && mode === "freelancer")}
                  disabled={!hydrated}
                >
                  Freelancer
                </button>
                <button
                  type="button"
                  onClick={() => handleModeChange("client")}
                  className={getModeToggleStyles(hydrated && mode === "client")}
                  disabled={!hydrated}
                >
                  Client
                </button>
              </div>
            </div>
          </div>

          <div className="px-4 py-2">
            <div className="flex items-center gap-2 text-xs text-text-secondary">
              <span
                className={cn(
                  "w-2 h-2 rounded-full",
                  mode === "freelancer" ? "bg-primary" : "bg-secondary"
                )}
              />
              <span>{MODE_LABELS[mode]}</span>
            </div>
          </div>
        </>
      )}

      {/* Collapsed Mode Indicator */}
      {isCollapsed && (
        <div className="flex justify-center pb-2">
          <span
            className={cn(
              "w-3 h-3 rounded-full",
              mode === "freelancer" ? "bg-primary" : "bg-secondary"
            )}
            title={MODE_LABELS[mode]}
          />
        </div>
      )}

      {/* Navigation */}
      <nav className={cn(
        "flex-1 space-y-2 overflow-y-auto",
        isCollapsed ? "p-2" : "p-4 pt-2"
      )}>
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={getNavLinkStyles(isActiveLink(item.href), isCollapsed)}
            title={isCollapsed ? item.label : undefined}
          >
            <Icon path={item.icon} size="md" />
            {!isCollapsed && <span className="font-medium">{item.label}</span>}
          </Link>
        ))}
      </nav>
    </aside>
  );
}
