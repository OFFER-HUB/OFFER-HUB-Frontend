"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/stores/auth-store";
import { verifyEmail, sendVerification } from "@/lib/api/auth";

type VerifyStatus = "loading" | "success" | "expired" | "invalid";

const REDIRECT_DELAY_MS = 4000;
const COOLDOWN_INITIAL_SECONDS = 60;

export interface EmailVerificationState {
  status: VerifyStatus;
  errorMessage: string;
  resending: boolean;
  resendSuccess: boolean;
  cooldown: number;
  handleResend: () => Promise<void>;
}

export function useEmailVerification(
  token: string | null,
  testState: VerifyStatus | null
): EmailVerificationState {
  const router = useRouter();
  const { token: userToken, isAuthenticated } = useAuthStore();

  const [status, setStatus] = useState<VerifyStatus>(testState ?? "loading");
  const [errorMessage, setErrorMessage] = useState("");
  const [resending, setResending] = useState(false);
  const [resendSuccess, setResendSuccess] = useState(false);
  const [cooldown, setCooldown] = useState(0);

  useEffect(() => {
    if (cooldown <= 0) return;
    const interval = setInterval(() => setCooldown((prev) => prev - 1), 1000);
    return () => clearInterval(interval);
  }, [cooldown]);

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
        useAuthStore.setState((state) => ({
          user: state.user ? { ...state.user, isEmailVerified: true } : null,
        }));
        setTimeout(() => router.push("/app/dashboard"), REDIRECT_DELAY_MS);
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
  }, [token, router, testState]);

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

  return { status, errorMessage, resending, resendSuccess, cooldown, handleResend };
}
