"use client";

import { useState, useEffect } from "react";
import { useAuthStore } from "@/stores/auth-store";
import { sendVerification } from "@/lib/api/auth";
import { cn } from "@/lib/cn";
import { Icon, ICON_PATHS } from "@/components/ui/Icon";
import { NEUMORPHIC_CARD } from "@/lib/styles";
import { Toast } from "@/components/ui/Toast";

const COOLDOWN_SECONDS = 60;

export function EmailVerificationBanner(): React.JSX.Element | null {
  const user = useAuthStore((state) => state.user);
  const token = useAuthStore((state) => state.token);
  const [isResending, setIsResending] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  useEffect(() => {
    let timer: ReturnType<typeof setInterval>;
    if (cooldown > 0) {
      timer = setInterval(() => {
        setCooldown((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [cooldown]);

  // Don't show if user is verified or not logged in
  if (!user || user.emailVerified) {
    return null;
  }

  const handleResend = async () => {
    if (!token || cooldown > 0 || isResending) return;

    setIsResending(true);
    setToast(null);

    try {
      await sendVerification(token);
      setToast({ message: "Verification email sent successfully!", type: "success" });
      setCooldown(COOLDOWN_SECONDS);
    } catch (error) {
      setToast({
        message: error instanceof Error ? error.message : "Failed to send verification email",
        type: "error",
      });
    } finally {
      setIsResending(false);
    }
  };

  return (
    <>
      <div
        className={cn(
          NEUMORPHIC_CARD,
          "flex flex-col sm:flex-row items-center justify-between gap-4 border-l-4 border-warning bg-warning/5"
        )}
      >
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-warning/10 flex items-center justify-center flex-shrink-0">
            <Icon path={ICON_PATHS.mail} size="md" className="text-warning" />
          </div>
          <div>
            <h3 className="font-bold text-text-primary">Verify your email</h3>
            <p className="text-sm text-text-secondary">
              Please verify your email address to access all features.
            </p>
          </div>
        </div>

        <button
          onClick={handleResend}
          disabled={isResending || cooldown > 0}
          className={cn(
            "px-5 py-2.5 rounded-xl text-sm font-medium transition-all duration-200",
            cooldown > 0 || isResending
              ? "bg-background text-text-secondary shadow-inner cursor-not-allowed"
              : "bg-white text-warning shadow-[4px_4px_8px_#d1d5db,-4px_-4px_8px_#ffffff] hover:shadow-[2px_2px_4px_#d1d5db,-2px_-2px_4px_#ffffff] active:shadow-inner cursor-pointer"
          )}
        >
          {isResending ? (
            "Sending..."
          ) : cooldown > 0 ? (
            `Resend in ${cooldown}s`
          ) : (
            "Resend Verification"
          )}
        </button>
      </div>

      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </>
  );
}
