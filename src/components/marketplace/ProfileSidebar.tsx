"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/cn";
import { useAuthStore } from "@/stores/auth-store";

export function ProfileSidebar() {
  const router = useRouter();
  const { user, isAuthenticated, logout } = useAuthStore();

  const handleLogout = () => {
    logout();
    router.push("/");
  };

  if (isAuthenticated && user) {
    // Show user profile when authenticated
    return (
      <aside
        className={cn(
          "w-full p-6 rounded-3xl bg-white",
          "shadow-[6px_6px_12px_#d1d5db,-6px_-6px_12px_#ffffff]"
        )}
      >
        {/* User Profile Card */}
        <div className="text-center mb-6">
          <div className="relative inline-block mb-3">
            <div
              className={cn(
                "w-20 h-20 rounded-full flex items-center justify-center",
                "bg-primary/10 text-primary text-2xl font-bold"
              )}
            >
              {user.username.charAt(0).toUpperCase()}
            </div>
            <span className="absolute bottom-1 right-1 w-4 h-4 bg-green-500 border-2 border-white rounded-full" />
          </div>
          <h3 className="font-bold text-text-primary">{user.username}</h3>
          <p className="text-sm text-text-secondary">{user.email}</p>
        </div>

        {/* Stats */}
        <div className="space-y-3 mb-6">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-primary" />
            <span className="text-sm text-primary font-medium">28 Available Connects</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-primary" />
            <span className="text-sm text-primary font-medium">9 Submitted Proposal</span>
          </div>
        </div>

        {/* Edit Profile Button */}
        <button
          className={cn(
            "w-full py-2.5 rounded-xl text-sm font-medium mb-3 cursor-pointer",
            "border-2 border-border-light text-text-primary",
            "hover:border-primary hover:text-primary transition-colors"
          )}
        >
          Edit Profile
        </button>

        {/* Logout Button */}
        <button
          onClick={handleLogout}
          className={cn(
            "w-full py-2.5 rounded-xl text-sm font-medium cursor-pointer",
            "bg-error/10 text-error border-2 border-error/20",
            "hover:bg-error/20 hover:border-error/40 transition-all duration-200",
            "flex items-center justify-center gap-2"
          )}
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
          Logout
        </button>
      </aside>
    );
  }

  // Show sign-in prompt when not authenticated
  return (
    <aside
      className={cn(
        "w-full p-6 rounded-3xl bg-white",
        "shadow-[6px_6px_12px_#d1d5db,-6px_-6px_12px_#ffffff]"
      )}
    >
      {/* Illustration Placeholder */}
      <div className="flex justify-center mb-4">
        <div className="relative w-32 h-32">
          <svg viewBox="0 0 200 200" className="w-full h-full">
            {/* Simple illustration */}
            <circle cx="100" cy="180" rx="80" ry="20" fill="#E1E4ED" />
            <rect x="60" y="80" width="80" height="100" rx="8" fill="#149A9B" opacity="0.2" />
            <circle cx="100" cy="60" r="30" fill="#149A9B" opacity="0.3" />
            <circle cx="100" cy="60" r="20" fill="#149A9B" opacity="0.5" />
            <text x="100" y="65" textAnchor="middle" fill="#149A9B" fontSize="20">?</text>
          </svg>
        </div>
      </div>

      {/* Content */}
      <div className="text-center mb-6">
        <p className="text-xs text-text-secondary uppercase tracking-wider mb-2">Guest User</p>
        <h3 className="font-bold text-text-primary mb-2">Start your journey</h3>
        <p className="text-sm text-text-secondary">
          Prioritize jobs based on your skills and make employers look for you, not the other way around.
        </p>
      </div>

      {/* CTA Button */}
      <Link
        href="/register"
        className={cn(
          "block w-full py-3 rounded-xl text-sm font-semibold text-center",
          "bg-primary text-white",
          "hover:bg-primary-hover transition-all duration-200",
          "shadow-[4px_4px_8px_#d1d5db,-4px_-4px_8px_#ffffff]",
          "hover:shadow-[6px_6px_12px_#d1d5db,-6px_-6px_12px_#ffffff]",
          "active:shadow-[inset_4px_4px_8px_rgba(0,0,0,0.2)]"
        )}
      >
        Get Started
      </Link>

      {/* Sign In Link */}
      <p className="text-center mt-4 text-sm text-text-secondary">
        Already have an account?{" "}
        <Link href="/login" className="text-primary font-medium hover:underline">
          Sign In
        </Link>
      </p>
    </aside>
  );
}
