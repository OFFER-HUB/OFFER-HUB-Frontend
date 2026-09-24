"use client";

import { Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Icon, ICON_PATHS, LoadingSpinner } from "@/components/ui/Icon";
import { useAuthStore } from "@/stores/auth-store";
import { useEmailVerification } from "@/hooks/useEmailVerification";

function VerifyEmailInner(): React.JSX.Element {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const testState = searchParams.get("testState") as
    | "loading"
    | "success"
    | "expired"
    | "invalid"
    | null;

  const { isAuthenticated } = useAuthStore();
  const { status, errorMessage, resending, resendSuccess, cooldown, handleResend } =
    useEmailVerification(token, testState);

  return (
    <div className="w-full max-w-md p-8 rounded-3xl bg-white shadow-[var(--shadow-neumorphic-light)] dark:bg-secondary dark:shadow-[var(--shadow-neumorphic-dark)] text-center transition-all duration-300">
      {status === "loading" && (
        <div className="flex flex-col items-center py-6">
          <div className="relative flex items-center justify-center w-20 h-20 rounded-full bg-background dark:bg-background/20 shadow-[inset_3px_3px_6px_rgba(0,0,0,0.1),inset_-3px_-3px_6px_#ffffff] dark:shadow-none mb-6">
            <LoadingSpinner className="w-10 h-10 text-primary" />
          </div>
          <h2 className="text-xl font-bold text-text-primary mb-2">Verifying Your Email</h2>
          <p className="text-sm text-text-secondary">
            Please wait while we validate your credentials…
          </p>
        </div>
      )}

      {status === "success" && (
        <div className="flex flex-col items-center py-4 animate-fade-in">
          <div className="flex items-center justify-center w-20 h-20 rounded-full bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 mb-6 shadow-[2px_2px_4px_#d1d5db,-2px_-2px_4px_#ffffff] dark:shadow-none">
            <Icon path={ICON_PATHS.check} className="w-10 h-10 animate-draw-check" />
          </div>
          <h2 className="text-2xl font-bold text-text-primary mb-2">Email Verified!</h2>
          <p className="text-sm text-text-secondary mb-6 leading-relaxed">
            Thank you for verifying your email address. Your account features are now completely
            unlocked.
          </p>
          <div className="w-full p-4 rounded-2xl bg-background/50 dark:bg-background/10 text-xs text-text-secondary flex items-center justify-center gap-2">
            <span>Redirecting to your dashboard</span>
            <span className="flex gap-0.5">
              <span
                className="w-1.5 h-1.5 rounded-full bg-primary animate-bounce"
                style={{ animationDelay: "-0.3s" }}
              />
              <span
                className="w-1.5 h-1.5 rounded-full bg-primary animate-bounce"
                style={{ animationDelay: "-0.15s" }}
              />
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
            The verification token has expired. For security reasons, email verification links are
            only valid for a limited time.
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
            {errorMessage ||
              "The verification link is invalid, corrupted, or has already been used to verify this account."}
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
