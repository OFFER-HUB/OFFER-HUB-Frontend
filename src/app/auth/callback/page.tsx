"use client";

import { useEffect, useState, useRef } from "react";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/cn";
import { useAuthStore } from "@/stores/auth-store";
import { oauthCallback, type OAuthProvider } from "@/lib/api/oauth";
import { LoadingSpinner, Icon, ICON_PATHS } from "@/components/ui/Icon";

type CallbackState =
  | { type: "loading" }
  | { type: "processing" }
  | { type: "success" }
  | { type: "error"; message: string };

export default function OAuthCallbackPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { login, redirectAfterLogin, setRedirectAfterLogin } = useAuthStore();
  const [state, setState] = useState<CallbackState>({ type: "loading" });
  const processedRef = useRef(false);

  useEffect(() => {
    async function handleOAuthCallback() {
      // Prevent re-running after we've processed the callback
      if (processedRef.current) return;

      // Wait for session to load
      if (status === "loading") return;

      // No session means user cancelled or error
      if (!session?.provider || !session?.providerAccountId || !session?.oauthEmail) {
        // Only set error if we haven't processed yet and status is not loading
        if (status === "unauthenticated") {
          setState({ type: "error", message: "OAuth authentication was cancelled or failed" });
        }
        return;
      }

      // Mark as processed to prevent re-runs
      processedRef.current = true;
      setState({ type: "processing" });

      try {
        const provider = session.provider.toUpperCase() as OAuthProvider;
        const result = await oauthCallback({
          provider,
          providerAccountId: session.providerAccountId,
          email: session.oauthEmail,
          name: session.oauthName,
          avatarUrl: session.oauthAvatarUrl,
        });

        // LOGIN or REGISTER success
        login(
          {
            id: result.user.id,
            email: result.user.email,
            username: result.user.username,
            type: result.user.type as "BUYER" | "SELLER" | "BOTH",
            balance: result.user.balance || undefined,
            wallet: result.user.wallet || undefined,
          },
          result.token,
          result.refreshToken ?? null
        );

        // Clear NextAuth session (we use our own JWT)
        await signOut({ redirect: false });

        if (result.action === "REGISTER") {
          localStorage.setItem("show-onboarding-tour", "true");
        }

        setState({ type: "success" });

        // Redirect to dashboard or saved path
        const destination = redirectAfterLogin || "/app/dashboard"; // /app/dashboard redirects based on mode
        setRedirectAfterLogin(null);
        router.push(destination);
      } catch (error) {
        console.error("OAuth callback error:", error);

        // Clear NextAuth session on error
        await signOut({ redirect: false });

        setState({
          type: "error",
          message: error instanceof Error ? error.message : "Failed to authenticate with OAuth",
        });
      }
    }

    handleOAuthCallback();
  }, [session, status, login, router, redirectAfterLogin, setRedirectAfterLogin]);

  function handleBackToLogin() {
    router.push("/login");
  }

  // Loading state
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

  // Error state
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
            onClick={handleBackToLogin}
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

  // Success state (brief, will redirect)
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
