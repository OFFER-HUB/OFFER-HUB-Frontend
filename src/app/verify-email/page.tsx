"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Icon, ICON_PATHS, LoadingSpinner } from "@/components/ui/Icon";
import { cn } from "@/lib/cn";
import { useAuthStore } from "@/stores/auth-store";
import { verifyEmail, sendVerification } from "@/lib/api/auth";

const REDIRECT_DELAY_MS = 4000;
const COOLDOWN_INITIAL_SECONDS = 60;

function VerifyEmailInner(): React.JSX.Element {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const testState = searchParams.get("testState") as "loading" | "success" | "expired" | "invalid" | null;

  const { token: userToken, isAuthenticated, user } = useAuthStore();
  const [status, setStatus] = useState<"loading" | "success" | "expired" | "invalid">(testState || "loading");
  const [errorMessage, setErrorMessage] = useState("");
  const [resending, setResending] = useState(false);
  const [resendSuccess, setResendSuccess] = useState(false);
  const [cooldown, setCooldown] = useState(0);

  // Drive the resend button cooldown counter
  useEffect(() => {
    if (cooldown <= 0) return;
    const interval = setInterval(() => {
      setCooldown((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [cooldown]);

  // Attempt verification if token is present
  useEffect(() => {
    if (testState) {
      setStatus(testState);
      return;
    }

    if (!token) {
      setStatus("invalid");
      return;
    }

    async function attemptVerification() {
      try {
        await verifyEmail(token!);
        setStatus("success");

        // Optimistically update isEmailVerified in auth store
        useAuthStore.setState((state) => ({
          user: state.user ? { ...state.user, isEmailVerified: true } : null,
        }));

        // Graceful redirect to app dashboard
        setTimeout(() => {
          router.push("/app/dashboard");
        }, REDIRECT_DELAY_MS);
      } catch (err) {
        const msg = err instanceof Error ? err.message : "Invalid or expired verification token";
        setErrorMessage(msg);
        if (msg.toLowerCase().includes("expired") || msg.toLowerCase().includes("timeout")) {
          setStatus("expired");
        } else {
          setStatus("invalid");
        }
      }
    }

    void attemptVerification();
  }, [token, router]);

  const handleResend = async () => {
    if (resending || cooldown > 0) return;
    if (!isAuthenticated || !userToken) {
      router.push("/login?redirect=/verify-email");
      return;
    }

    setResending(true);
    setResendSuccess(false);
    try {
      await sendVerification(userToken);
      setResendSuccess(true);
      setCooldown(COOLDOWN_INITIAL_SECONDS);
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to resend verification email");
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="w-full max-w-md p-8 rounded-3xl bg-white shadow-[var(--shadow-neumorphic-light)] dark:bg-secondary dark:shadow-[var(--shadow-neumorphic-dark)] text-center transition-all duration-300">
      {status === "loading" && (
        <div className="flex flex-col items-center py-6">
          <div className="relative flex items-center justify-center w-20 h-20 rounded-full bg-background dark:bg-background/20 shadow-[inset_3px_3px_6px_rgba(0,0,0,0.1),inset_-3px_-3px_6px_#ffffff] dark:shadow-none mb-6">
            <LoadingSpinner className="w-10 h-10 text-primary" />
          </div>
          <h2 className="text-xl font-bold text-text-primary mb-2">Verifying Your Email</h2>
          <p className="text-sm text-text-secondary">Please wait while we validate your credentials…</p>
        </div>
      )}

      {status === "success" && (
        <div className="flex flex-col items-center py-4 animate-fade-in">
          <div className="flex items-center justify-center w-20 h-20 rounded-full bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 mb-6 shadow-[2px_2px_4px_#d1d5db,-2px_-2px_4px_#ffffff] dark:shadow-none">
            <Icon path={ICON_PATHS.check} className="w-10 h-10 animate-draw-check" />
          </div>
          <h2 className="text-2xl font-bold text-text-primary mb-2">Email Verified!</h2>
          <p className="text-sm text-text-secondary mb-6 leading-relaxed">
            Thank you for verifying your email address. Your account features are now completely unlocked.
          </p>
          <div className="w-full p-4 rounded-2xl bg-background/50 dark:bg-background/10 text-xs text-text-secondary flex items-center justify-center gap-2">
            <span>Redirecting to your dashboard</span>
            <span className="flex gap-0.5">
              <span className="w-1.5 h-1.5 rounded-full bg-primary animate-bounce" style={{ animationDelay: "-0.3s" }} />
              <span className="w-1.5 h-1.5 rounded-full bg-primary animate-bounce" style={{ animationDelay: "-0.15s" }} />
              <span className="w-1.5 h-1.5 rounded-full bg-primary animate-bounce" />
            </span>
          </div>
        </div>
      )}

      {status === "expired" && (
        <div className="flex flex-col items-center py-4 animate-fade-in">
          <div className="flex items-center justify-center w-20 h-20 rounded-full bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 mb-6 shadow-[2px_2px_4px_#d1d5db,-2px_-2px_4px_#ffffff] dark:shadow-none">
            <Icon path={ICON_PATHS.clock} className="w-10 h-10" />
          </div>
          <h2 className="text-2xl font-bold text-text-primary mb-2">Link Expired</h2>
          <p className="text-sm text-text-secondary mb-6 leading-relaxed">
            The verification token has expired. For security reasons, email verification links are only valid for a limited time.
          </p>

          <div className="flex flex-col w-full gap-3">
            {isAuthenticated ? (
              <button
                type="button"
                onClick={handleResend}
                disabled={resending || cooldown > 0}
                className="w-full flex items-center justify-center gap-2 px-5 py-3 rounded-xl cursor-pointer bg-primary text-white text-sm font-semibold shadow-[4px_4px_8px_#d1d5db,-4px_-4px_8px_#ffffff] dark:shadow-none hover:shadow-[6px_6px_12px_#d1d5db,-6px_-6px_12px_#ffffff] transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {resending ? (
                  <>
                    <LoadingSpinner size="sm" />
                    <span>Sending…</span>
                  </>
                ) : cooldown > 0 ? (
                  <span>Resend in {cooldown}s</span>
                ) : (
                  <>
                    <Icon path={ICON_PATHS.mail} size="sm" />
                    <span>Resend Verification Email</span>
                  </>
                )}
              </button>
            ) : (
              <button
                type="button"
                onClick={() => router.push("/login?redirect=/verify-email")}
                className="w-full flex items-center justify-center gap-2 px-5 py-3 rounded-xl cursor-pointer bg-primary text-white text-sm font-semibold shadow-[4px_4px_8px_#d1d5db,-4px_-4px_8px_#ffffff] dark:shadow-none hover:shadow-[6px_6px_12px_#d1d5db,-6px_-6px_12px_#ffffff] transition-all duration-200"
              >
                <span>Sign in to Resend Link</span>
                <Icon path={ICON_PATHS.arrowRight} size="sm" />
              </button>
            )}
            {resendSuccess && (
              <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-2 font-medium">
                A fresh verification link has been sent to your inbox.
              </p>
            )}
          </div>
        </div>
      )}

      {status === "invalid" && (
        <div className="flex flex-col items-center py-4 animate-fade-in">
          <div className="flex items-center justify-center w-20 h-20 rounded-full bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 mb-6 shadow-[2px_2px_4px_#d1d5db,-2px_-2px_4px_#ffffff] dark:shadow-none">
            <Icon path={ICON_PATHS.alertTriangle} className="w-10 h-10" />
          </div>
          <h2 className="text-2xl font-bold text-text-primary mb-2">Invalid Token</h2>
          <p className="text-sm text-text-secondary mb-6 leading-relaxed">
            {errorMessage || "The verification link is invalid, corrupted, or has already been used to verify this account."}
          </p>

          <button
            type="button"
            onClick={() => router.push("/app/dashboard")}
            className="w-full flex items-center justify-center gap-2 px-5 py-3 rounded-xl cursor-pointer bg-primary text-white text-sm font-semibold shadow-[4px_4px_8px_#d1d5db,-4px_-4px_8px_#ffffff] dark:shadow-none hover:shadow-[6px_6px_12px_#d1d5db,-6px_-6px_12px_#ffffff] transition-all duration-200"
          >
            <span>Go to Dashboard</span>
            <Icon path={ICON_PATHS.arrowRight} size="sm" />
          </button>
        </div>
      )}
    </div>
  );
}

export default function VerifyEmailPage(): React.JSX.Element {
  return (
    <div className="min-h-screen bg-background flex flex-col justify-center items-center p-4">
      <Suspense
        fallback={
          <div className="w-full max-w-md p-8 rounded-3xl bg-white shadow-[var(--shadow-neumorphic-light)] dark:bg-secondary dark:shadow-[var(--shadow-neumorphic-dark)] text-center">
            <div className="flex flex-col items-center py-6">
              <LoadingSpinner className="w-10 h-10 text-primary mb-4" />
              <p className="text-sm text-text-secondary">Loading page resources…</p>
            </div>
          </div>
        }
      >
        <VerifyEmailInner />
      </Suspense>
    </div>
  );
}
