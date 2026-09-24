"use client";

import { useState, useEffect, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import { useSession, signIn, signOut } from "next-auth/react";
import { cn } from "@/lib/cn";
import { useAuthStore } from "@/stores/auth-store";
import { Icon, ICON_PATHS, LoadingSpinner } from "@/components/ui/Icon";
import {
  getLinkedAccounts,
  linkAccount,
  unlinkAccount,
  type LinkedAccount,
  type OAuthProvider,
} from "@/lib/api/oauth";

const PROVIDERS: { id: OAuthProvider; name: string; icon: React.ReactNode; bgClass: string }[] = [
  {
    id: "GITHUB",
    name: "GitHub",
    icon: (
      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
        <path
          fillRule="evenodd"
          d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
          clipRule="evenodd"
        />
      </svg>
    ),
    bgClass: "bg-[#24292e]",
  },
  {
    id: "GOOGLE",
    name: "Google",
    icon: (
      <svg className="w-5 h-5" viewBox="0 0 24 24">
        <path
          fill="#4285F4"
          d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
        />
        <path
          fill="#34A853"
          d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
        />
        <path
          fill="#FBBC05"
          d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
        />
        <path
          fill="#EA4335"
          d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
        />
      </svg>
    ),
    bgClass: "bg-white border border-border-light",
  },
];

export function ConnectedAccounts() {
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

  if (isLoading) {
    return (
      <div className={cn(
        "p-6 rounded-2xl",
        "bg-white",
        "shadow-[6px_6px_12px_#d1d5db,-6px_-6px_12px_#ffffff]"
      )}>
        <div className="flex items-center justify-center py-8">
          <LoadingSpinner className="text-primary" />
        </div>
      </div>
    );
  }

  return (
    <div className={cn(
      "p-6 rounded-2xl",
      "bg-white",
      "shadow-[6px_6px_12px_#d1d5db,-6px_-6px_12px_#ffffff]"
    )}>
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
          <Icon path={ICON_PATHS.shield} size="md" className="text-primary" />
        </div>
        <div>
          <h2 className="text-lg font-bold text-text-primary">Connected Accounts</h2>
          <p className="text-sm text-text-secondary">
            Link your social accounts for easier login
          </p>
        </div>
      </div>

      {/* Success/Error Messages */}
      {successMessage && (
        <div className={cn(
          "mb-4 p-3 rounded-xl flex items-center gap-2",
          "bg-success/10 text-success"
        )}>
          <Icon path={ICON_PATHS.check} size="sm" />
          <span className="text-sm">{successMessage}</span>
        </div>
      )}

      {error && (
        <div className={cn(
          "mb-4 p-3 rounded-xl flex items-center gap-2",
          "bg-error/10 text-error"
        )}>
          <Icon path={ICON_PATHS.alertCircle} size="sm" />
          <span className="text-sm">{error}</span>
        </div>
      )}

      <div className="space-y-3">
        {PROVIDERS.map((provider) => {
          const connected = isConnected(provider.id);
          const accountInfo = getAccountInfo(provider.id);
          const isActionLoading = actionLoading === provider.id;

          return (
            <div
              key={provider.id}
              className={cn(
                "flex items-center justify-between p-4 rounded-xl",
                "bg-background",
                "shadow-[inset_2px_2px_4px_#d1d5db,inset_-2px_-2px_4px_#ffffff]"
              )}
            >
              <div className="flex items-center gap-3">
                <div
                  className={cn(
                    "w-10 h-10 rounded-lg flex items-center justify-center",
                    provider.id === "GITHUB" ? "bg-[#24292e] text-white" : "bg-white border border-border-light"
                  )}
                >
                  {provider.icon}
                </div>
                <div>
                  <p className="font-medium text-text-primary">{provider.name}</p>
                  {connected && accountInfo?.email ? (
                    <p className="text-xs text-text-secondary">{accountInfo.email}</p>
                  ) : (
                    <p className="text-xs text-text-secondary">
                      {connected ? "Connected" : "Not connected"}
                    </p>
                  )}
                </div>
              </div>

              <button
                onClick={() =>
                  connected ? handleDisconnect(provider.id) : handleConnect(provider.id)
                }
                disabled={isActionLoading}
                className={cn(
                  "px-4 py-2 rounded-xl text-sm font-medium",
                  "transition-all duration-200",
                  connected
                    ? [
                        "text-error",
                        "bg-error/10",
                        "hover:bg-error/20",
                      ]
                    : [
                        "text-primary",
                        "bg-primary/10",
                        "hover:bg-primary/20",
                      ],
                  "disabled:opacity-50 disabled:cursor-not-allowed"
                )}
              >
                {isActionLoading ? (
                  <LoadingSpinner className="w-4 h-4" />
                ) : connected ? (
                  "Disconnect"
                ) : (
                  "Connect"
                )}
              </button>
            </div>
          );
        })}
      </div>

      <p className="mt-4 text-xs text-text-secondary text-center">
        You must have at least one login method (password or connected account).
      </p>
    </div>
  );
}
