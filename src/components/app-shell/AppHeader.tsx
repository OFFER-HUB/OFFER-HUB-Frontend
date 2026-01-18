"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/cn";
import { Logo } from "@/components/ui";
import { Icon, ICON_PATHS } from "@/components/ui/Icon";
import { useAuthStore } from "@/stores/auth-store";
import {
  ICON_BUTTON,
  USER_AVATAR_BUTTON,
  DROPDOWN_MENU,
  DROPDOWN_ITEM,
  DROPDOWN_ITEM_DANGER,
} from "@/lib/styles";

const NAV_LINKS = [
  { href: "/app/dashboard", label: "Dashboard" },
  { href: "/marketplace", label: "Marketplace" },
  { href: "/faq", label: "FAQ" },
  { href: "/help", label: "Help" },
];

interface AppHeaderProps {
  onMenuClick: () => void;
}

function isActiveLink(pathname: string, href: string): boolean {
  if (href === "/app/dashboard") {
    return pathname === "/app/dashboard" || pathname.startsWith("/app/");
  }
  return pathname.startsWith(href);
}

export function AppHeader({ onMenuClick }: AppHeaderProps): React.JSX.Element {
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();
  const { user, logout } = useAuthStore();

  useEffect(() => {
    function handleClickOutside(event: MouseEvent): void {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setIsUserMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  async function handleLogout(): Promise<void> {
    await logout();
    setIsUserMenuOpen(false);
    window.location.href = "/";
  }

  function toggleUserMenu(): void {
    setIsUserMenuOpen((prev) => !prev);
  }

  function closeUserMenu(): void {
    setIsUserMenuOpen(false);
  }

  return (
    <header
      className={cn(
        "h-16 lg:h-20 flex items-center justify-between px-4 lg:px-6",
        "bg-white",
        "shadow-[0_4px_6px_-1px_rgba(0,0,0,0.05)]"
      )}
    >
      <div className="flex items-center gap-4">
        <button
          onClick={onMenuClick}
          className={cn(
            "lg:hidden p-2 rounded-xl cursor-pointer",
            "text-text-primary",
            "hover:bg-background transition-colors"
          )}
          aria-label="Toggle menu"
        >
          <Icon path={ICON_PATHS.menu} size="lg" />
        </button>

        <Logo size="md" />

        <nav className="hidden lg:flex items-center gap-6 ml-8">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "font-medium transition-colors relative",
                isActiveLink(pathname, link.href)
                  ? "text-primary"
                  : "text-text-secondary hover:text-text-primary"
              )}
            >
              {link.label}
              {isActiveLink(pathname, link.href) && (
                <span className="absolute -bottom-1 left-0 right-0 h-0.5 bg-primary rounded-full" />
              )}
            </Link>
          ))}
        </nav>
      </div>

      <div className="flex items-center gap-3">
        <button className={cn(ICON_BUTTON, "relative cursor-pointer")}>
          <Icon path={ICON_PATHS.bell} size="md" className="text-text-secondary" />
          <span className="absolute top-1 right-1 w-2 h-2 bg-error rounded-full" />
        </button>

        {user && (
          <div ref={userMenuRef} className="relative">
            <button onClick={toggleUserMenu} className={USER_AVATAR_BUTTON}>
              {user.username.charAt(0).toUpperCase()}
            </button>

            {isUserMenuOpen && (
              <div className={DROPDOWN_MENU}>
                <div className="px-4 py-2 border-b border-border-light">
                  <p className="text-sm font-medium text-text-primary truncate">
                    {user.username}
                  </p>
                  <p className="text-xs text-text-secondary truncate">{user.email}</p>
                </div>
                <Link href="/app/dashboard" onClick={closeUserMenu} className={DROPDOWN_ITEM}>
                  <Icon path={ICON_PATHS.home} size="sm" className="text-text-secondary" />
                  Dashboard
                </Link>
                <Link href="/app/profile" onClick={closeUserMenu} className={DROPDOWN_ITEM}>
                  <Icon path={ICON_PATHS.user} size="sm" className="text-text-secondary" />
                  My Profile
                </Link>
                <Link href="/app/settings" onClick={closeUserMenu} className={DROPDOWN_ITEM}>
                  <Icon path={ICON_PATHS.settings} size="sm" className="text-text-secondary" />
                  Settings
                </Link>
                <div className="border-t border-border-light my-1" />
                <button onClick={handleLogout} className={DROPDOWN_ITEM_DANGER}>
                  <Icon path={ICON_PATHS.logout} size="sm" />
                  Sign Out
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </header>
  );
}
