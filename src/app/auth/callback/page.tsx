"use client";

import { useRouter } from "next/navigation";
import { cn } from "@/lib/cn";
import { LoadingSpinner, Icon, ICON_PATHS } from "@/components/ui/Icon";
import { useOAuthCallback } from "@/hooks/useOAuthCallback";

export default function OAuthCallbackPage() {
  const router = useRouter();
  const state = useOAuthCallback();

  if (state.type === "loading" || state.type === "processing") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div
          className={cn(
            "p-8 rounded-2xl text-center max-w-md w-full mx-4",
            "bg-white shadow-[6px_6px_12px_#d1d5db,-6px_-6px_12px_#ffffff]"
          )}
        >
          <LoadingSpinner className="w-12 h-12 mx-auto text-primary mb-4" />
          <h1 className="text-xl font-bold text-text-primary mb-2">
            {state.type === "loading" ? "Loading..." : "Processing..."}
          </h1>
          <p className="text-text-secondary">
            {state.type === "loading"
              ? "Checking authentication status"
              : "Completing OAuth authentication"}
          </p>
        </div>
      </div>
    );
  }

  if (state.type === "error") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <div
          className={cn(
            "p-8 rounded-2xl text-center max-w-md w-full",
            "bg-white shadow-[6px_6px_12px_#d1d5db,-6px_-6px_12px_#ffffff]"
          )}
        >
          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 rounded-full bg-error/10 flex items-center justify-center">
              <Icon path={ICON_PATHS.x} size="lg" className="text-error" />
            </div>
          </div>
          <h1 className="text-xl font-bold text-text-primary mb-2">Authentication Failed</h1>
          <p className="text-text-secondary mb-6">{state.message}</p>
          <button
            onClick={() => router.push("/login")}
            className={cn(
              "px-6 py-3 rounded-xl font-medium",
              "bg-primary text-white",
              "shadow-[3px_3px_6px_#d1d5db,-3px_-3px_6px_#ffffff]",
              "hover:shadow-[5px_5px_10px_#d1d5db,-5px_-5px_10px_#ffffff]",
              "transition-all duration-200"
            )}
          >
            Back to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div
        className={cn(
          "p-8 rounded-2xl text-center max-w-md w-full mx-4",
          "bg-white shadow-[6px_6px_12px_#d1d5db,-6px_-6px_12px_#ffffff]"
        )}
      >
        <div className="flex justify-center mb-6">
          <div className="w-16 h-16 rounded-full bg-success/10 flex items-center justify-center">
            <Icon path={ICON_PATHS.check} size="lg" className="text-success" />
          </div>
        </div>
        <h1 className="text-xl font-bold text-text-primary mb-2">Success!</h1>
        <p className="text-text-secondary">Redirecting to dashboard...</p>
      </div>
    </div>
  );
}
