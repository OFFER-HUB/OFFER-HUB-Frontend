"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Container, Logo } from "@/components/ui";
import { Icon, ICON_PATHS } from "@/components/ui/Icon";
import { cn } from "@/lib/cn";
import { useAuthStore } from "@/stores/auth-store";
import {
  USER_AVATAR_BUTTON,
  DROPDOWN_MENU,
  DROPDOWN_ITEM,
  DROPDOWN_ITEM_DANGER,
} from "@/lib/styles";

const PUBLIC_NAV_LINKS = [
  { href: "/marketplace", label: "Marketplace" },
  { href: "/faq", label: "FAQ" },
  { href: "/help", label: "Help" },
];

function isActiveLink(pathname: string, href: string): boolean {
  if (href === "/") return pathname === "/";
  return pathname.startsWith(href);
}

export function Navbar(): React.JSX.Element {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();
  const router = useRouter();
  const { user, isAuthenticated, logout } = useAuthStore();

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
    router.push("/");
  }

  function toggleUserMenu(): void {
    setIsUserMenuOpen((prev) => !prev);
  }

  function closeUserMenu(): void {
    setIsUserMenuOpen(false);
  }

  function toggleMobileMenu(): void {
    setIsMobileMenuOpen((prev) => !prev);
  }

  function closeMobileMenu(): void {
    setIsMobileMenuOpen(false);
  }

  const navLinks = isAuthenticated
    ? [{ href: "/app/dashboard", label: "Dashboard" }, ...PUBLIC_NAV_LINKS]
    : PUBLIC_NAV_LINKS;

  return (
    <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-md shadow-[var(--shadow-neumorphic-light)]">
      <Container>
        <nav className="flex items-center justify-between h-16 lg:h-20">
          <Logo size="md" />

          <div className="hidden lg:flex items-center gap-8">
            {navLinks.map((link) => (
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
          </div>

          <div className="hidden lg:flex items-center gap-3">
            {isAuthenticated && user ? (
              <div ref={userMenuRef} className="relative">
                <button onClick={toggleUserMenu} className={USER_AVATAR_BUTTON}>
                  {user.username.charAt(0).toUpperCase()}
                </button>

                {isUserMenuOpen && (
                  <div className={DROPDOWN_MENU}>
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
            ) : (
              <>
                <Link
                  href="/login"
                  className="px-4 py-2 text-sm font-medium text-text-secondary hover:text-text-primary transition-colors"
                >
                  Login
                </Link>
                <Link href="/register">
                  <button className="px-5 py-2.5 text-sm font-semibold text-white bg-primary rounded-xl shadow-[var(--shadow-neumorphic-light)] hover:bg-primary-hover active:shadow-[var(--shadow-neumorphic-inset-light)] transition-all duration-200 cursor-pointer">
                    Sign Up
                  </button>
                </Link>
              </>
            )}
          </div>

          <button
            className="lg:hidden p-2 text-text-primary cursor-pointer"
            onClick={toggleMobileMenu}
            aria-label="Toggle menu"
          >
            <Icon
              path={isMobileMenuOpen ? ICON_PATHS.close : ICON_PATHS.menu}
              size="lg"
            />
          </button>
        </nav>

        <div
          className={cn(
            "lg:hidden overflow-hidden transition-all duration-300",
            isMobileMenuOpen ? "max-h-96 pb-4" : "max-h-0"
          )}
        >
          <div className="flex flex-col gap-4">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "font-medium py-2 transition-colors",
                  isActiveLink(pathname, link.href)
                    ? "text-primary"
                    : "text-text-secondary hover:text-text-primary"
                )}
                onClick={closeMobileMenu}
              >
                {link.label}
              </Link>
            ))}
            <div className="flex flex-col gap-3 pt-4 border-t border-border-light">
              {isAuthenticated && user ? (
                <>
                  <Link
                    href="/app/profile"
                    onClick={closeMobileMenu}
                    className="text-text-secondary hover:text-text-primary font-medium py-2 transition-colors"
                  >
                    My Profile
                  </Link>
                  <Link
                    href="/app/settings"
                    onClick={closeMobileMenu}
                    className="text-text-secondary hover:text-text-primary font-medium py-2 transition-colors"
                  >
                    Settings
                  </Link>
                  <button
                    onClick={() => {
                      handleLogout();
                      closeMobileMenu();
                    }}
                    className="text-error font-medium py-2 text-left cursor-pointer"
                  >
                    Sign Out
                  </button>
                </>
              ) : (
                <>
                  <Link
                    href="/login"
                    className="text-text-secondary hover:text-text-primary font-medium py-2 text-center transition-colors"
                    onClick={closeMobileMenu}
                  >
                    Login
                  </Link>
                  <Link href="/register" onClick={closeMobileMenu}>
                    <button className="w-full px-5 py-3 text-sm font-semibold text-white bg-primary rounded-xl shadow-[var(--shadow-neumorphic-light)] hover:bg-primary-hover active:shadow-[var(--shadow-neumorphic-inset-light)] transition-all duration-200 cursor-pointer">
                      Sign Up
                    </button>
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </Container>
    </header>
  );
}
