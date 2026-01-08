"use client";

import { useState } from "react";
import Link from "next/link";
import { Container, Logo } from "@/components/ui";
import { cn } from "@/lib/cn";

const navLinks = [
  { href: "/marketplace", label: "Marketplace" },
  { href: "/faq", label: "FAQ" },
  { href: "/help", label: "Help" },
];

export function Navbar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-md shadow-[var(--shadow-neumorphic-light)]">
      <Container>
        <nav className="flex items-center justify-between h-16 lg:h-20">
          {/* Logo */}
          <Logo size="md" />

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center gap-8">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-text-secondary hover:text-text-primary font-medium transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Desktop Auth Buttons */}
          <div className="hidden lg:flex items-center gap-3">
            <Link
              href="/login"
              className="px-4 py-2 text-sm font-medium text-text-secondary hover:text-text-primary transition-colors"
            >
              Login
            </Link>
            <Link href="/register">
              <button className="px-5 py-2.5 text-sm font-semibold text-white bg-primary rounded-xl shadow-[var(--shadow-neumorphic-light)] hover:bg-primary-hover active:shadow-[var(--shadow-neumorphic-inset-light)] transition-all duration-200">
                Sign Up
              </button>
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="lg:hidden p-2 text-text-primary"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label="Toggle menu"
          >
            {isMobileMenuOpen ? (
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </button>
        </nav>

        {/* Mobile Menu */}
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
                className="text-text-secondary hover:text-text-primary font-medium py-2"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                {link.label}
              </Link>
            ))}
            <div className="flex flex-col gap-3 pt-4 border-t border-border-light">
              <Link
                href="/login"
                className="text-text-secondary hover:text-text-primary font-medium py-2 text-center transition-colors"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Login
              </Link>
              <Link href="/register" onClick={() => setIsMobileMenuOpen(false)}>
                <button className="w-full px-5 py-3 text-sm font-semibold text-white bg-primary rounded-xl shadow-[var(--shadow-neumorphic-light)] hover:bg-primary-hover active:shadow-[var(--shadow-neumorphic-inset-light)] transition-all duration-200">
                  Sign Up
                </button>
              </Link>
            </div>
          </div>
        </div>
      </Container>
    </header>
  );
}
