"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn, signOut, useSession } from "next-auth/react";
import { useAuthStore } from "@/stores/auth-store";
import { getLinkedAccounts, linkAccount, unlinkAccount, type LinkedAccount, type OAuthProvider } from "@/lib/api/oauth";

function isOAuthProvider(value: string): value is OAuthProvider {
  return value === "GITHUB" || value === "GOOGLE";
}

export function useConnectedAccounts() {
  const { data: session, status: sessionStatus } = useSession();
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = useAuthStore((state) => state.token);
  const [linkedAccounts, setLinkedAccounts] = useState<LinkedAccount[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<OAuthProvider | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const fetchLinkedAccounts = useCallback(async () => {
    if (!token) {
      setLinkedAccounts([]);
      setIsLoading(false);
      return;
    }
    try {
      setLinkedAccounts(await getLinkedAccounts(token));
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Failed to fetch linked accounts");
    } finally {
      setIsLoading(false);
    }
  }, [token]);

  useEffect(() => { void fetchLinkedAccounts(); }, [fetchLinkedAccounts]);

  useEffect(() => {
    let active = true;
    const provider = session?.provider?.toUpperCase() ?? "";
    if (searchParams.get("linked") !== "true" || sessionStatus === "loading" || !token || !isOAuthProvider(provider)) return;
    if (!session?.providerAccountId || !session.oauthEmail) {
      setError("The provider did not return the account details required to link this account.");
      router.replace("/app/profile");
      return;
    }
    setActionLoading(provider);
    setError(null);
    void (async () => {
      try {
        await linkAccount(token, {
          provider,
          providerAccountId: session.providerAccountId!,
          email: session.oauthEmail!,
          name: session.oauthName,
          avatarUrl: session.oauthAvatarUrl,
        });
        await signOut({ redirect: false });
        if (!active) return;
        setSuccessMessage(`${session.provider} account linked successfully!`);
        await fetchLinkedAccounts();
        router.replace("/app/profile");
      } catch (cause) {
        if (active) {
          setError(cause instanceof Error ? cause.message : "Failed to link account");
          router.replace("/app/profile");
        }
      } finally {
        if (active) setActionLoading(null);
      }
    })();
    return () => { active = false; };
  }, [searchParams, session, sessionStatus, token, fetchLinkedAccounts, router]);

  useEffect(() => {
    if (!successMessage && !error) return;
    const timer = window.setTimeout(() => { setSuccessMessage(null); setError(null); }, 5000);
    return () => window.clearTimeout(timer);
  }, [successMessage, error]);

  const handleConnect = useCallback((provider: OAuthProvider) => {
    void signIn(provider.toLowerCase(), { callbackUrl: "/app/profile?linked=true" });
  }, []);
  const handleDisconnect = useCallback(async (provider: OAuthProvider) => {
    if (!token) return;
    setActionLoading(provider);
    setError(null);
    try {
      await unlinkAccount(token, provider);
      setSuccessMessage(`${provider} account disconnected.`);
      await fetchLinkedAccounts();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Failed to disconnect account");
    } finally {
      setActionLoading(null);
    }
  }, [token, fetchLinkedAccounts]);

  return { linkedAccounts, isLoading, actionLoading, error, successMessage, handleConnect, handleDisconnect };
}
