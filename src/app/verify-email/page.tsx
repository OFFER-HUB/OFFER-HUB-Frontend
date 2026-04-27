"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { verifyEmail } from "@/lib/api/auth";
import { cn } from "@/lib/cn";
import { Icon, ICON_PATHS, LoadingSpinner } from "@/components/ui/Icon";
import { NEUMORPHIC_CARD, PRIMARY_BUTTON } from "@/lib/styles";
import { useAuthStore } from "@/stores/auth-store";

function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get("token");
  const updateUser = useAuthStore((state) => state.login);
  const currentUser = useAuthStore((state) => state.user);
  const currentToken = useAuthStore((state) => state.token);

  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [message, setMessage] = useState("");

  useEffect(() => {
    async function performVerification() {
      if (!token) {
        setStatus("error");
        setMessage("Invalid or missing verification token.");
        return;
      }

      try {
        const result = await verifyEmail(token);
        setStatus("success");
        setMessage(result.message || "Email verified successfully!");

        // Update local state if user is logged in
        if (currentUser && currentToken) {
          updateUser({ ...currentUser, emailVerified: true }, currentToken);
        }

        // Redirect to dashboard after 3 seconds
        setTimeout(() => {
          router.push("/app/dashboard");
        }, 3000);
      } catch (error) {
        setStatus("error");
        setMessage(error instanceof Error ? error.message : "Verification failed. The link may be expired.");
      }
    }

    performVerification();
  }, [token, router, currentUser, currentToken, updateUser]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className={cn(NEUMORPHIC_CARD, "max-w-md w-full text-center space-y-6")}>
        <div className="flex justify-center">
          <div
            className={cn(
              "w-20 h-20 rounded-full flex items-center justify-center",
              status === "loading" && "bg-primary/10",
              status === "success" && "bg-success/10",
              status === "error" && "bg-error/10"
            )}
          >
            {status === "loading" && <LoadingSpinner className="text-primary" />}
            {status === "success" && <Icon path={ICON_PATHS.check} size="xl" className="text-success" />}
            {status === "error" && <Icon path={ICON_PATHS.x} size="xl" className="text-error" />}
          </div>
        </div>

        <h1 className="text-2xl font-bold text-text-primary">
          {status === "loading" && "Verifying your email..."}
          {status === "success" && "Email Verified!"}
          {status === "error" && "Verification Failed"}
        </h1>

        <p className="text-text-secondary leading-relaxed">
          {message || "We're processing your request. This will only take a moment."}
        </p>

        {status !== "loading" && (
          <div className="pt-4 flex flex-col gap-3">
            <Link
              href="/app/dashboard"
              className={cn(PRIMARY_BUTTON, "justify-center w-full")}
            >
              Go to Dashboard
            </Link>
            {status === "error" && (
              <Link
                href="/app/settings"
                className="text-sm text-primary font-medium hover:underline"
              >
                Go to Account Settings
              </Link>
            )}
          </div>
        )}

        {status === "success" && (
          <p className="text-xs text-text-secondary">
            Redirecting to dashboard in a few seconds...
          </p>
        )}
      </div>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-background">
          <LoadingSpinner size="lg" />
        </div>
      }
    >
      <VerifyEmailContent />
    </Suspense>
  );
}
