"use client";

import { useState } from "react";
import Link from "next/link";
import { Icon, ICON_PATHS, LoadingSpinner } from "@/components/ui/Icon";
import { AuthInput } from "@/components/auth/AuthInput";
import { forgotPassword } from "@/lib/api/auth";

type PageState = "idle" | "loading" | "success" | "error";

function validateEmail(email: string): string | null {
  if (!email.trim()) return "Email address is required.";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return "Please enter a valid email address.";
  return null;
}

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [fieldError, setFieldError] = useState<string | null>(null);
  const [pageState, setPageState] = useState<PageState>("idle");
  const [apiError, setApiError] = useState<string | null>(null);

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
    if (fieldError) setFieldError(null);
    if (apiError) setApiError(null);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const validationError = validateEmail(email);
    if (validationError) {
      setFieldError(validationError);
      return;
    }

    setPageState("loading");
    setApiError(null);

    try {
      await forgotPassword(email);
      setPageState("success");
    } catch {
      setApiError(
        "Something went wrong. Please try again or contact support if the problem persists."
      );
      setPageState("error");
    }
  };

  const handleTryAgain = () => {
    setPageState("idle");
    setApiError(null);
  };

  return (
    <main className="min-h-screen bg-background flex items-center justify-center px-4 py-12">
      <div
        className="pointer-events-none fixed inset-0 -z-10 opacity-30"
        style={{ background: "radial-gradient(ellipse 80% 60% at 50% 0%, #15949C22, transparent)" }}
        aria-hidden="true"
      />

      <div className="w-full max-w-md">
        <div className="flex justify-center mb-8">
          <Link href="/" className="text-2xl font-bold tracking-tight" style={{ color: "#149A9B" }}>
            OFFER<span className="text-text-primary">HUB</span>
          </Link>
        </div>

        <div
          className="rounded-2xl p-8 md:p-10"
          style={{
            backgroundColor: "#002333",
            boxShadow: "6px 6px 12px #0a0f1a, -6px -6px 12px #1e2a4a",
          }}
        >
          {pageState === "success" ? (
            <div className="flex flex-col items-center text-center gap-5">
              <div
                className="w-16 h-16 rounded-full flex items-center justify-center"
                style={{
                  backgroundColor: "#16a34a18",
                  boxShadow: "inset 4px 4px 8px #0a0f1a, inset -4px -4px 8px #1e2a4a",
                }}
              >
                <Icon path={ICON_PATHS.check} size="xl" className="text-green-600" />
              </div>

              <div>
                <h1 className="text-xl font-bold text-white mb-2">Check your email</h1>
                <p className="text-sm leading-relaxed" style={{ color: "#6D758F" }}>
                  If an account exists for{" "}
                  <span className="font-semibold" style={{ color: "#B4B9C9" }}>
                    {email}
                  </span>
                  , you&apos;ll receive a password reset link shortly. Be sure to check your spam
                  folder.
                </p>
              </div>

              <Link
                href="/login"
                className="flex items-center gap-2 text-sm font-semibold transition-opacity hover:opacity-80"
                style={{ color: "#149A9B" }}
              >
                <Icon path={ICON_PATHS.chevronLeft} size="sm" />
                Back to login
              </Link>
            </div>
          ) : (
            <>
              <div className="mb-8">
                <h1 className="text-2xl font-bold text-white mb-2">Forgot your password?</h1>
                <p className="text-sm leading-relaxed" style={{ color: "#6D758F" }}>
                  Enter the email address associated with your account and we&apos;ll send you a
                  link to reset your password.
                </p>
              </div>

              <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-5">
                <AuthInput
                  label="Email address"
                  type="email"
                  name="email"
                  value={email}
                  onChange={handleEmailChange}
                  placeholder="you@example.com"
                  error={fieldError ?? undefined}
                  autoComplete="email"
                />

                {apiError && (
                  <div
                    role="alert"
                    className="flex items-start gap-3 rounded-xl px-4 py-3 text-sm"
                    style={{
                      backgroundColor: "#FF000012",
                      border: "1px solid #FF000033",
                      color: "#FF0000",
                    }}
                  >
                    <Icon
                      path={ICON_PATHS.alertCircle}
                      size="sm"
                      className="mt-0.5 flex-shrink-0"
                    />
                    <span>{apiError}</span>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={pageState === "loading"}
                  className="relative w-full py-3 rounded-xl text-sm font-bold text-white transition-all duration-200 disabled:opacity-70 disabled:cursor-not-allowed"
                  style={{
                    background: "linear-gradient(to right, #002333, #15949C)",
                    boxShadow: "6px 6px 12px #0a0f1a, -6px -6px 12px #1e2a4a",
                  }}
                >
                  {pageState === "loading" ? (
                    <span className="flex items-center justify-center gap-2">
                      <LoadingSpinner size="sm" />
                      Sending reset link…
                    </span>
                  ) : pageState === "error" ? (
                    <span onClick={handleTryAgain}>Try again</span>
                  ) : (
                    "Send Reset Link"
                  )}
                </button>
              </form>

              <div className="mt-6 text-center">
                <Link
                  href="/login"
                  className="inline-flex items-center gap-2 text-sm font-semibold transition-opacity hover:opacity-80"
                  style={{ color: "#149A9B" }}
                >
                  <Icon path={ICON_PATHS.chevronLeft} size="sm" />
                  Back to login
                </Link>
              </div>
            </>
          )}
        </div>

        <p className="mt-6 text-center text-xs" style={{ color: "#6D758F" }}>
          Don&apos;t have an account?{" "}
          <Link
            href="/register"
            className="font-semibold transition-opacity hover:opacity-80"
            style={{ color: "#149A9B" }}
          >
            Sign up for free
          </Link>
        </p>
      </div>
    </main>
  );
}
