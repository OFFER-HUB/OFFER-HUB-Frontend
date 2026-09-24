"use client";

import { useState } from "react";
import Link from "next/link";
import { AuthLayout, SocialAuthButtons, AuthInput, AuthDivider } from "@/components/auth";
import { WalletSignInButton } from "@/components/auth/WalletSignInButton";
import { cn } from "@/lib/cn";
import { useLoginForm } from "@/hooks/useLoginForm";

type AuthTabId = "email" | "wallet";

const AUTH_TABS: ReadonlyArray<{ id: AuthTabId; label: string }> = [
  { id: "email", label: "Email / Password" },
  { id: "wallet", label: "Connect Wallet" },
];

export function LoginForm() {
  const { formData, errors, isLoading, showSuccessMessage, handleChange, handleSubmit, handleWalletSignedIn } =
    useLoginForm();

  // Email stays the default: it is what every existing account uses, and the
  // wallet path is additive rather than a replacement.
  const [activeTab, setActiveTab] = useState<AuthTabId>("email");

  /**
   * Arrow keys move between tabs, as a tablist is expected to behave — only the
   * selected tab is in the Tab order, so without this the second one would be
   * unreachable by keyboard.
   */
  const handleTabKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key !== "ArrowLeft" && e.key !== "ArrowRight") return;

    e.preventDefault();
    const current = AUTH_TABS.findIndex((t) => t.id === activeTab);
    const delta = e.key === "ArrowRight" ? 1 : -1;
    const next = AUTH_TABS[(current + delta + AUTH_TABS.length) % AUTH_TABS.length];

    setActiveTab(next.id);
    document.getElementById(`auth-tab-${next.id}`)?.focus();
  };

  return (
    <AuthLayout>
      {/* Success Message */}
      {showSuccessMessage && (
        <div
          className={cn(
            "mb-4 p-3 rounded-xl",
            "bg-success/10 border border-success/20",
            "animate-scale-in"
          )}
        >
          <div className="flex items-center gap-2">
            <svg
              className="w-5 h-5 text-success flex-shrink-0"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <p className="text-sm text-success font-medium">
              Account created successfully! Please sign in.
            </p>
          </div>
        </div>
      )}

      {/* Header */}
      <div
        className="text-center mb-4 opacity-0 animate-fade-in-up"
        style={{ animationFillMode: "forwards" }}
      >
        <h1 className="text-2xl font-bold text-text-primary mb-1">Welcome back</h1>
        <p className="text-sm text-text-secondary">Sign in to your account to continue</p>
      </div>

      {/* Method tabs */}
      <div
        role="tablist"
        aria-label="Sign-in method"
        onKeyDown={handleTabKeyDown}
        className={cn(
          "flex gap-2 p-1 rounded-2xl bg-background mb-4",
          "shadow-[inset_2px_2px_4px_#d1d5db,inset_-2px_-2px_4px_#ffffff]",
          "opacity-0 animate-fade-in-up"
        )}
        style={{ animationDelay: "0.08s", animationFillMode: "forwards" }}
      >
        {AUTH_TABS.map(({ id, label }) => {
          const active = activeTab === id;
          return (
            <button
              key={id}
              type="button"
              role="tab"
              id={`auth-tab-${id}`}
              aria-selected={active}
              aria-controls={`auth-panel-${id}`}
              // Only the selected tab is reachable by Tab; the arrow keys move
              // between them, which is how a tablist is meant to behave.
              tabIndex={active ? 0 : -1}
              onClick={() => setActiveTab(id)}
              className={cn(
                "flex-1 px-3 py-2.5 rounded-xl text-sm font-medium transition-all cursor-pointer",
                "focus-visible:ring-2 focus-visible:ring-primary/40 outline-none",
                active
                  ? "bg-primary text-white shadow-[2px_2px_6px_#d1d5db]"
                  : "text-text-secondary hover:text-text-primary"
              )}
            >
              {label}
            </button>
          );
        })}
      </div>

      {/* Method panel — keyed by activeTab so switching tabs remounts this
          wrapper and replays the entrance animation, instead of an instant
          swap between two permanently-mounted, hidden-toggled panels.
          min-h lives here (not on the wallet panel alone) so the card is the
          same height under both tabs — otherwise the box snaps to its new
          size the instant the panel remounts, which reads as an abrupt cut
          no matter how smooth the fade itself is. */}
      <div
        key={activeTab}
        className="animate-tab-panel-in min-h-[22rem] flex flex-col justify-center"
      >
        {activeTab === "wallet" ? (
          <div
            role="tabpanel"
            id="auth-panel-wallet"
            aria-labelledby="auth-tab-wallet"
            className="flex flex-col gap-8 px-2"
          >
            <div className="text-center">
              <h2 className="text-lg font-semibold text-text-primary">Choose your wallet</h2>
              <p className="text-sm text-text-secondary mt-2">
                Select a wallet to sign in securely
              </p>
            </div>

            <WalletSignInButton disabled={isLoading} onSignedIn={handleWalletSignedIn} />
          </div>
        ) : (
          <div
            role="tabpanel"
            id="auth-panel-email"
            aria-labelledby="auth-tab-email"
          >
            {/* Social Auth */}
            <SocialAuthButtons />

            {/* Divider */}
            <AuthDivider />

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-3">
              <AuthInput
                label="Email"
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="you@example.com"
                error={errors.email}
                autoComplete="email"
              />

              <div>
                <label className="block text-sm font-medium text-text-primary mb-2">
                  Password
                </label>
                <AuthInput
                  label=""
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Enter your password"
                  error={errors.password}
                  autoComplete="current-password"
                />
                <div className="flex justify-end mt-2">
                  <Link
                    href="/forgot-password"
                    className="text-sm font-medium text-primary hover:text-primary-hover transition-colors"
                  >
                    Forgot your password?
                  </Link>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className={cn(
                  "w-full px-6 py-3 rounded-xl font-medium mt-4 cursor-pointer",
                  "bg-primary text-white",
                  "shadow-[4px_4px_8px_#d1d5db,-4px_-4px_8px_#ffffff]",
                  "hover:bg-primary-hover hover:shadow-[6px_6px_12px_#d1d5db,-6px_-6px_12px_#ffffff] hover:scale-[1.02]",
                  "active:shadow-[inset_4px_4px_8px_rgba(0,0,0,0.2)] active:scale-[0.98]",
                  "disabled:opacity-70 disabled:cursor-not-allowed disabled:hover:scale-100",
                  "transition-all duration-200"
                )}
              >
                {isLoading ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      />
                    </svg>
                    Signing in...
                  </span>
                ) : (
                  "Sign in"
                )}
              </button>
            </form>
          </div>
        )}
      </div>

      {/* Register Link */}
      <p
        className="text-center text-sm text-text-secondary mt-4 opacity-0 animate-fade-in-up"
        style={{ animationDelay: "0.35s", animationFillMode: "forwards" }}
      >
        Don&apos;t have an account?{" "}
        <Link
          href="/register"
          className="text-primary font-medium hover:text-primary-hover transition-colors"
        >
          Sign up
        </Link>
      </p>
    </AuthLayout>
  );
}
