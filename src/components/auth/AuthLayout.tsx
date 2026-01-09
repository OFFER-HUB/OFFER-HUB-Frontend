"use client";

import Link from "next/link";
import { Logo } from "@/components/ui";
import { cn } from "@/lib/cn";

interface AuthLayoutProps {
  children: React.ReactNode;
}

export function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <div className="h-screen bg-background relative overflow-hidden">
      {/* Header */}
      <header className="absolute top-0 left-0 right-0 z-10 p-4 sm:p-6">
        <Link href="/">
          <Logo size="md" />
        </Link>
      </header>

      {/* Wave Background */}
      <div className="absolute inset-0 pointer-events-none">
        <svg
          className="absolute bottom-0 left-0 right-0 w-full h-auto"
          viewBox="0 0 1440 400"
          preserveAspectRatio="none"
          style={{ minHeight: "45vh" }}
        >
          {/* Wave 1 - Lightest, back */}
          <path
            className="animate-wave-1"
            fill="#DEEFE7"
            fillOpacity="0.4"
            d="M0,120L60,140C120,160,240,200,360,200C480,200,600,160,720,140C840,120,960,120,1080,140C1200,160,1320,200,1380,220L1440,240L1440,400L1380,400C1320,400,1200,400,1080,400C960,400,840,400,720,400C600,400,480,400,360,400C240,400,120,400,60,400L0,400Z"
          />
          {/* Wave 2 */}
          <path
            className="animate-wave-2"
            fill="#DEEFE7"
            fillOpacity="0.5"
            d="M0,180L48,192C96,204,192,228,288,220C384,212,480,172,576,160C672,148,768,164,864,180C960,196,1056,212,1152,204C1248,196,1344,164,1392,148L1440,132L1440,400L1392,400C1344,400,1248,400,1152,400C1056,400,960,400,864,400C768,400,672,400,576,400C480,400,384,400,288,400C192,400,96,400,48,400L0,400Z"
          />
          {/* Wave 3 */}
          <path
            className="animate-wave-3"
            fill="#15949C"
            fillOpacity="0.25"
            d="M0,240L48,228C96,216,192,192,288,192C384,192,480,216,576,232C672,248,768,256,864,244C960,232,1056,200,1152,188C1248,176,1344,184,1392,188L1440,192L1440,400L1392,400C1344,400,1248,400,1152,400C1056,400,960,400,864,400C768,400,672,400,576,400C480,400,384,400,288,400C192,400,96,400,48,400L0,400Z"
          />
          {/* Wave 4 - Darkest, front */}
          <path
            className="animate-wave-4"
            fill="#149A9B"
            fillOpacity="0.2"
            d="M0,300L48,288C96,276,192,252,288,256C384,260,480,292,576,292C672,292,768,260,864,248C960,236,1056,244,1152,256C1248,268,1344,284,1392,292L1440,300L1440,400L1392,400C1344,400,1248,400,1152,400C1056,400,960,400,864,400C768,400,672,400,576,400C480,400,384,400,288,400C192,400,96,400,48,400L0,400Z"
          />
        </svg>
      </div>

      {/* Content */}
      <main className="relative z-10 flex items-center justify-center h-full px-4">
        <div
          className={cn(
            "w-full max-w-md p-6 sm:p-8 rounded-3xl bg-white",
            "shadow-[6px_6px_12px_#d1d5db,-6px_-6px_12px_#ffffff]",
            "opacity-0 animate-scale-in",
            "max-h-[90vh] overflow-y-auto scrollbar-hide"
          )}
          style={{ animationFillMode: "forwards" }}
        >
          {children}
        </div>
      </main>
    </div>
  );
}
