"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/cn";
import { useModeStore, getNavigationItems, type UserMode } from "@/stores/mode-store";

interface AppSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const MODE_TOGGLE_BASE_STYLES = cn(
  "flex-1 py-2 px-3 rounded-lg text-sm font-medium",
  "transition-all duration-200 cursor-pointer"
);

const MODE_TOGGLE_ACTIVE_STYLES = "bg-primary text-white shadow-[2px_2px_4px_#d1d5db,-2px_-2px_4px_#ffffff]";
const MODE_TOGGLE_INACTIVE_STYLES = "text-text-secondary hover:text-text-primary";

const NAV_LINK_BASE_STYLES = cn(
  "flex items-center gap-3 px-4 py-3 rounded-xl",
  "transition-all duration-200"
);

const NAV_LINK_ACTIVE_STYLES = "bg-primary text-white shadow-[4px_4px_8px_#d1d5db,-4px_-4px_8px_#ffffff]";
const NAV_LINK_INACTIVE_STYLES = "text-text-secondary hover:bg-background hover:text-text-primary hover:shadow-[4px_4px_8px_#d1d5db,-4px_-4px_8px_#ffffff]";

const MODE_LABELS: Record<UserMode, string> = {
  freelancer: "Finding work",
  client: "Hiring talent",
};

function getModeToggleStyles(isActive: boolean): string {
  return cn(MODE_TOGGLE_BASE_STYLES, isActive ? MODE_TOGGLE_ACTIVE_STYLES : MODE_TOGGLE_INACTIVE_STYLES);
}

function getNavLinkStyles(isActive: boolean): string {
  return cn(NAV_LINK_BASE_STYLES, isActive ? NAV_LINK_ACTIVE_STYLES : NAV_LINK_INACTIVE_STYLES);
}

export function AppSidebar({ isOpen: _isOpen, onClose: _onClose }: AppSidebarProps): React.JSX.Element {
  const pathname = usePathname();
  const { mode, setMode } = useModeStore();
  const navItems = getNavigationItems(mode);

  function isActiveLink(href: string): boolean {
    return pathname === href || pathname.startsWith(href + "/");
  }

  return (
    <aside
      className={cn(
        "w-64 m-6 mr-0",
        "bg-white rounded-2xl",
        "shadow-[6px_6px_12px_#d1d5db,-6px_-6px_12px_#ffffff]",
        "flex-shrink-0",
        "flex flex-col"
      )}
    >
      <div className="p-4 pb-2">
        <div
          className={cn(
            "p-2 rounded-xl",
            "bg-background",
            "shadow-[inset_2px_2px_4px_#d1d5db,inset_-2px_-2px_4px_#ffffff]"
          )}
        >
          <div className="flex items-center gap-1">
            <button
              onClick={() => setMode("freelancer")}
              className={getModeToggleStyles(mode === "freelancer")}
            >
              Freelancer
            </button>
            <button
              onClick={() => setMode("client")}
              className={getModeToggleStyles(mode === "client")}
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

      <nav className="flex-1 p-4 pt-2 space-y-2 overflow-y-auto">
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={getNavLinkStyles(isActiveLink(item.href))}
          >
            <svg
              className="w-5 h-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d={item.icon}
              />
            </svg>
            <span className="font-medium">{item.label}</span>
          </Link>
        ))}
      </nav>
    </aside>
  );
}
