"use client";

import { useState, useEffect, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import { useSession, signIn, signOut } from "next-auth/react";
import { useAuthStore } from "@/stores/auth-store";
import {
  getLinkedAccounts,
  linkAccount,
  unlinkAccount,
  type LinkedAccount,
  type OAuthProvider,
} from "@/lib/api/oauth";

export function useConnectedAccounts() {
  const { data: session, status: sessionStatus } = useSession();
  const searchParams = useSearchParams();
  const token = useAuthStore((state) => state.token);
  const [linkedAccounts, setLinkedAccounts] = useState<LinkedAccount[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<OAuthProvider | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const fetchLinkedAccounts = useCallback(async () => {
    if (!token) return;
    try {
      const accounts = await getLinkedAccounts(token);
      setLinkedAccounts(accounts);
    } catch (err) {
      console.error("Failed to fetch linked accounts:", err);
    } finally {
      setIsLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchLinkedAccounts();
  }, [fetchLinkedAccounts]);

  // Handle OAuth callback for linking
  useEffect(() => {
    async function handleLinkCallback() {
      const linked = searchParams.get("linked");
      if (linked !== "true" || sessionStatus === "loading" || !session?.provider || !token) {
        return;
      }

      setActionLoading(session.provider.toUpperCase() as OAuthProvider);
      setError(null);

      try {
        await linkAccount(token, {
          provider: session.provider.toUpperCase() as OAuthProvider,
          providerAccountId: session.providerAccountId!,
          email: session.oauthEmail!,
          name: session.oauthName,
          avatarUrl: session.oauthAvatarUrl,
        });

        // Clear NextAuth session
        await signOut({ redirect: false });

        setSuccessMessage(`${session.provider} account linked successfully!`);
        await fetchLinkedAccounts();

        // Clear the URL parameter
        window.history.replaceState({}, "", "/app/profile");
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to link account");
      } finally {
        setActionLoading(null);
      }
    }

    handleLinkCallback();
  }, [searchParams, session, sessionStatus, token, fetchLinkedAccounts]);

  // Clear messages after timeout
  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => setSuccessMessage(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [successMessage]);

  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => setError(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  const handleConnect = (provider: OAuthProvider) => {
    signIn(provider.toLowerCase(), {
      callbackUrl: "/app/profile?linked=true",
    });
  };

  const handleDisconnect = async (provider: OAuthProvider) => {
    if (!token) return;

    setActionLoading(provider);
    setError(null);

    try {
      await unlinkAccount(token, provider);
      setSuccessMessage(`${provider} account disconnected.`);
      await fetchLinkedAccounts();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to disconnect account");
    } finally {
      setActionLoading(null);
    }
  };

  const isConnected = (provider: OAuthProvider) =>
    linkedAccounts.some((a) => a.provider === provider);

  const getAccountInfo = (provider: OAuthProvider) =>
    linkedAccounts.find((a) => a.provider === provider);

  return {
    isLoading,
    actionLoading,
    error,
    successMessage,
    handleConnect,
    handleDisconnect,
    isConnected,
    getAccountInfo,
  };
}
