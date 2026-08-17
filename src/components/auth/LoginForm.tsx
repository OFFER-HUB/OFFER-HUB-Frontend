"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { AuthLayout, SocialAuthButtons, AuthInput, AuthDivider } from "@/components/auth";
import { WalletSignInButton } from "@/components/auth/WalletSignInButton";
import { cn } from "@/lib/cn";
import { isNewUser } from "@/lib/auth/is-new-user";
import { useAuthStore } from "@/stores/auth-store";
import { useModeStore } from "@/stores/mode-store";
import type { LoginFormData, AuthFormErrors } from "@/types/auth.types";

type AuthTabId = "email" | "wallet";

const AUTH_TABS: ReadonlyArray<{ id: AuthTabId; label: string }> = [
  { id: "email", label: "Email / Password" },
  { id: "wallet", label: "Connect Wallet" },
];

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const login = useAuthStore((state) => state.login);
  const setRedirectAfterLogin = useAuthStore((state) => state.setRedirectAfterLogin);
  const mode = useModeStore((state) => state.mode);
  const registered = searchParams.get("registered") === "true";
  const redirect = searchParams.get("redirect");
  const [isLoading, setIsLoading] = useState(false);
  const [showSuccessMessage, setShowSuccessMessage] = useState(registered);
  const [formData, setFormData] = useState<LoginFormData>({
    email: "",
    password: "",
  });
  const [errors, setErrors] = useState<AuthFormErrors>({});
  const [redirectPath] = useState<string | null>(redirect);
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

  useEffect(() => {
    if (redirect) {
      setRedirectAfterLogin(redirect);
    }
  }, [redirect, setRedirectAfterLogin]);

  useEffect(() => {
    if (!registered) return;

    const timeoutId = window.setTimeout(() => {
      setShowSuccessMessage(false);
    }, 5000);

    return () => window.clearTimeout(timeoutId);
  }, [registered]);

  const validateForm = (): boolean => {
    const newErrors: AuthFormErrors = {};

    if (!formData.email) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Please enter a valid email address";
    }

    if (!formData.password) {
      newErrors.password = "Password is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name as keyof AuthFormErrors]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  /**
   * Where a successful sign-in lands, whatever proved the identity.
   * Shared so wallet auth cannot drift from the email path.
   */
  const goToDashboard = () => {
    const defaultDashboard =
      mode === "client" ? "/app/client/dashboard" : "/app/freelancer/dashboard";

    router.push(redirectPath || defaultDashboard);
  };

  /**
   * Wallet-first accounts have no firstName. Send those users to onboarding
   * instead of the dashboard. Email login is unchanged.
   */
  const handleWalletSignedIn = () => {
    const user = useAuthStore.getState().user;
    if (user && isNewUser(user)) {
      router.push("/onboarding");
      return;
    }

    goToDashboard();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsLoading(true);

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        // Handle OAuth-only account trying to login with password
        if (data.error?.code === "LOGIN_VIA_OAUTH_REQUIRED") {
          const providers = (data.error.details?.providers as string[]) || [];
          const providerNames = providers
            .map((p: string) => p.charAt(0).toUpperCase() + p.slice(1))
            .join(" or ");
          setErrors({
            email: `This account uses ${providerNames} for login. Please use the ${providerNames} button above.`,
          });
        } else {
          setErrors({ email: data.error?.message || data.error || "Login failed" });
        }
        setIsLoading(false);
        return;
      }

      // Update auth state with user and token from API
      login(data.user, data.token);

      setIsLoading(false);

      goToDashboard();
    } catch (error) {
      console.error("Login error:", error);
      setErrors({ email: "Connection error. Please try again." });
      setIsLoading(false);
    }
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

      {/* Wallet panel */}
      <div
        role="tabpanel"
        id="auth-panel-wallet"
        aria-labelledby="auth-tab-wallet"
        hidden={activeTab !== "wallet"}
        // Roughly the height of the email panel, so switching tabs does not
        // collapse the card and shove the footer links up the page.
        className="min-h-[22rem] flex flex-col justify-center gap-5"
      >
        <div className="text-center">
          <h2 className="text-base font-semibold text-text-primary">Choose your wallet</h2>
          <p className="text-xs text-text-secondary mt-1">Select a wallet to sign in securely</p>
        </div>

        <WalletSignInButton disabled={isLoading} onSignedIn={handleWalletSignedIn} />
      </div>

      {/* Email panel — the pre-existing sign-in experience, unchanged */}
      <div
        role="tabpanel"
        id="auth-panel-email"
        aria-labelledby="auth-tab-email"
        hidden={activeTab !== "email"}
      >
        {/* Social Auth */}
        <div
          className="opacity-0 animate-fade-in-up"
          style={{ animationDelay: "0.1s", animationFillMode: "forwards" }}
        >
          <SocialAuthButtons />
        </div>

        {/* Divider */}
        <div
          className="opacity-0 animate-fade-in-up"
          style={{ animationDelay: "0.15s", animationFillMode: "forwards" }}
        >
          <AuthDivider />
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-3">
          <div
            className="opacity-0 animate-fade-in-up"
            style={{ animationDelay: "0.2s", animationFillMode: "forwards" }}
          >
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
          </div>

          <div
            className="opacity-0 animate-fade-in-up"
            style={{ animationDelay: "0.25s", animationFillMode: "forwards" }}
          >
            <label className="block text-sm font-medium text-text-primary mb-2">Password</label>
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
          <div
            className="opacity-0 animate-fade-in-up"
            style={{ animationDelay: "0.3s", animationFillMode: "forwards" }}
          >
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
          </div>
        </form>
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
