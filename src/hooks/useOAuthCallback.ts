"use client";

import { useEffect, useRef, useState } from "react";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/stores/auth-store";
import { isNewUser } from "@/lib/auth/is-new-user";
import { oauthCallback, OAuthCallbackError, type OAuthProvider } from "@/lib/api/oauth";

type CallbackState =
  | { type: "loading" }
  | { type: "processing" }
  | { type: "success" }
  | { type: "error"; message: string };

function describeCallbackError(error: unknown): string {
  if (error instanceof OAuthCallbackError) {
    switch (error.code) {
      case "EMAIL_REGISTERED_WITH_PASSWORD":
        return "This email is already registered with a password. Sign in with your password, then link this provider from your profile settings.";
      case "OAUTH_EMAIL_UNVERIFIED":
        return "Your provider has not verified this email address. Verify it with them and try again.";
      case "OAUTH_TOKEN_INVALID":
      case "OAUTH_IDENTITY_MISMATCH":
        return "We could not confirm your identity with the provider. Please try signing in again.";
      case "OAUTH_PROVIDER_UNAVAILABLE":
        return "The provider is unreachable right now. Please try again in a moment.";
    }
    return error.message;
  }
  return error instanceof Error ? error.message : "Failed to authenticate with OAuth";
}

export function useOAuthCallback(): CallbackState {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { login, redirectAfterLogin, setRedirectAfterLogin } = useAuthStore();
  const [state, setState] = useState<CallbackState>({ type: "loading" });
  const processedRef = useRef(false);

  useEffect(() => {
    async function run() {
      if (processedRef.current) return;
      if (status === "loading") return;

      if (!session?.provider || !session?.providerAccountId || !session?.oauthEmail) {
        if (status === "unauthenticated") {
          setState({ type: "error", message: "OAuth authentication was cancelled or failed" });
        }
        return;
      }

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
          accessToken: session.oauthAccessToken,
          idToken: session.oauthIdToken,
        });

        const oauthUser = {
          id: result.user.id,
          email: result.user.email,
          username: result.user.username,
          firstName: result.user.firstName ?? null,
          lastName: result.user.lastName ?? null,
          avatarUrl: session.oauthAvatarUrl,
          type: result.user.type as "BUYER" | "SELLER" | "BOTH",
          balance: result.user.balance || undefined,
          wallet: result.user.wallet || undefined,
        };
        login(oauthUser, result.token);
        await signOut({ redirect: false });

        if (result.action === "REGISTER") {
          localStorage.setItem("show-onboarding-tour", "true");
        }

        setState({ type: "success" });

        const destination = isNewUser(oauthUser)
          ? "/onboarding"
          : redirectAfterLogin || "/app/dashboard";
        setRedirectAfterLogin(null);
        router.push(destination);
      } catch (error) {
        console.error("OAuth callback error:", error);
        await signOut({ redirect: false });
        setState({ type: "error", message: describeCallbackError(error) });
      }
    }

    void run();
  }, [session, status, login, router, redirectAfterLogin, setRedirectAfterLogin]);

  return state;
}
