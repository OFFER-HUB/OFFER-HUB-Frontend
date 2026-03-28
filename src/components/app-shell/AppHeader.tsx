"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/cn";
import { Logo } from "@/components/ui";
import { Icon, ICON_PATHS } from "@/components/ui/Icon";
import { useAuthStore } from "@/stores/auth-store";
import { useNotificationStore } from "@/stores/notification-store";
import { NotificationDropdown } from "@/components/notifications";
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
  const [mounted, setMounted] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isNotifOpen, setIsNotifOpen] = useState(false);

  const userMenuRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);

  const pathname = usePathname();
  const { user, logout } = useAuthStore();
  const { unreadCount } = useNotificationStore();

  useEffect(() => {
    setMounted(true);

    function handleClickOutside(event: MouseEvent): void {
      // Close user menu
      if (
        userMenuRef.current &&
        !userMenuRef.current.contains(event.target as Node)
      ) {
        setIsUserMenuOpen(false);
      }
      // Close notification dropdown
      if (
        notifRef.current &&
        !notifRef.current.contains(event.target as Node)
      ) {
        setIsNotifOpen(false);
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
    setIsNotifOpen(false); // close notif if open
  }

  function closeUserMenu(): void {
    setIsUserMenuOpen(false);
  }

  function toggleNotif(): void {
    setIsNotifOpen((prev) => !prev);
    setIsUserMenuOpen(false); // close user menu if open
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
        {/* Notification Bell */}
        <div ref={notifRef} className="relative">
          <button
            onClick={toggleNotif}
            className={cn(ICON_BUTTON, "relative cursor-pointer")}
            aria-label={
              unreadCount > 0
                ? `${unreadCount} unread notifications`
                : "Notifications"
            }
            aria-expanded={isNotifOpen}
            aria-haspopup="dialog"
          >
            <Icon
              path={ICON_PATHS.bell}
              size="md"
              className="text-text-secondary"
            />
            {true && (
              <span
                className={cn(
                  "absolute -top-1 -right-1",
                  "min-w-[1.1rem] h-[1.1rem] px-0.5",
                  "flex items-center justify-center rounded-full",
                  "bg-error text-white text-[9px] font-bold leading-none"
                )}
              >
                {unreadCount > 99 ? "99+" : unreadCount}
              </span>
            )}
          </button>

          <NotificationDropdown
            isOpen={isNotifOpen}
            onClose={() => setIsNotifOpen(false)}
          />
        </div>

        {/* User Avatar + Menu */}
        {mounted && user && (
          <div ref={userMenuRef} className="relative">
            <button
              onClick={toggleUserMenu}
              className={cn(
                USER_AVATAR_BUTTON,
                "overflow-hidden transition-all duration-300",
                isUserMenuOpen &&
                  "shadow-[inset_4px_4px_8px_#d1d5db,inset_-4px_-4px_8px_#ffffff]"
              )}
            >
              {user.avatarUrl ? (
                <img
                  src={user.avatarUrl}
                  alt={user.username}
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="animate-fade-in">
                  {user.username.charAt(0).toUpperCase()}
                </span>
              )}
            </button>

            {isUserMenuOpen && (
              <div className={cn(DROPDOWN_MENU, "-right-1 top-[calc(100%+0.75rem)]")}>
                <div className="px-5 py-4 mb-2 border-b border-background">
                  <p className="text-sm font-bold text-text-primary truncate">
                    {user.username}
                  </p>
                  <p className="text-xs text-text-secondary truncate mt-0.5">
                    {user.email}
                  </p>
                </div>
                <div className="flex flex-col gap-1 pb-3">
                  <Link
                    href="/app/dashboard"
                    onClick={closeUserMenu}
                    className={cn(DROPDOWN_ITEM, "stagger-1")}
                  >
                    <div className="flex items-center gap-3">
                      <Icon
                        path={ICON_PATHS.home}
                        size="sm"
                        className="group-hover:text-primary transition-colors"
                      />
                      <span>Dashboard</span>
                    </div>
                    <Icon
                      path={ICON_PATHS.chevronRight}
                      size="sm"
                      className="opacity-0 group-hover:opacity-100 transition-all -translate-x-2 group-hover:translate-x-0"
                    />
                  </Link>
                  <Link
                    href="/app/profile"
                    onClick={closeUserMenu}
                    className={cn(DROPDOWN_ITEM, "stagger-2")}
                  >
                    <div className="flex items-center gap-3">
                      <Icon
                        path={ICON_PATHS.user}
                        size="sm"
                        className="group-hover:text-primary transition-colors"
                      />
                      <span>My Profile</span>
                    </div>
                    <Icon
                      path={ICON_PATHS.chevronRight}
                      size="sm"
                      className="opacity-0 group-hover:opacity-100 transition-all -translate-x-2 group-hover:translate-x-0"
                    />
                  </Link>
                  <Link
                    href="/app/settings"
                    onClick={closeUserMenu}
                    className={cn(DROPDOWN_ITEM, "stagger-3")}
                  >
                    <div className="flex items-center gap-3">
                      <Icon
                        path={ICON_PATHS.settings}
                        size="sm"
                        className="group-hover:text-primary transition-colors"
                      />
                      <span>Settings</span>
                    </div>
                    <Icon
                      path={ICON_PATHS.chevronRight}
                      size="sm"
                      className="opacity-0 group-hover:opacity-100 transition-all -translate-x-2 group-hover:translate-x-0"
                    />
                  </Link>
                  <div className="border-t border-background my-2 mx-4" />
                  <button
                    onClick={handleLogout}
                    className={cn(DROPDOWN_ITEM_DANGER, "stagger-4")}
                  >
                    <div className="flex items-center gap-3">
                      <Icon path={ICON_PATHS.logout} size="sm" />
                      <span>Sign Out</span>
                    </div>
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </header>
  );
}