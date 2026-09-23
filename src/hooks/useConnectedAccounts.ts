import { useCallback, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { signIn, signOut, useSession } from "next-auth/react";
import { useAuthStore } from "@/stores/auth-store";
import { getLinkedAccounts, linkAccount, unlinkAccount, type LinkedAccount, type OAuthProvider } from "@/lib/api/oauth";

export function useConnectedAccounts() {
  const token = useAuthStore((state) => state.token);
  const { data: session, status: sessionStatus } = useSession();
  const searchParams = useSearchParams();
  const [accounts, setAccounts] = useState<LinkedAccount[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<OAuthProvider | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    if (!token) return;
    try { setAccounts(await getLinkedAccounts(token)); }
    catch (cause) { setError(cause instanceof Error ? cause.message : "Failed to fetch linked accounts"); }
    finally { setIsLoading(false); }
  }, [token]);

  useEffect(() => { void refresh(); }, [refresh]);
  useEffect(() => {
    if (searchParams.get("linked") !== "true" || sessionStatus === "loading" || !session?.provider || !token) return;
    const provider = session.provider.toUpperCase() as OAuthProvider;
    setActionLoading(provider);
    void linkAccount(token, { provider, providerAccountId: session.providerAccountId!, email: session.oauthEmail!, name: session.oauthName, avatarUrl: session.oauthAvatarUrl })
      .then(() => signOut({ redirect: false }))
      .then(() => { setSuccessMessage(`${session.provider} account linked successfully!`); window.history.replaceState({}, "", "/app/profile"); return refresh(); })
      .catch((cause) => setError(cause instanceof Error ? cause.message : "Failed to link account"))
      .finally(() => setActionLoading(null));
  }, [refresh, searchParams, session, sessionStatus, token]);

  const connect = (provider: OAuthProvider) => signIn(provider.toLowerCase(), { callbackUrl: "/app/profile?linked=true" });
  const disconnect = async (provider: OAuthProvider) => {
    if (!token) return;
    setActionLoading(provider); setError(null);
    try { await unlinkAccount(token, provider); setSuccessMessage(`${provider} account disconnected.`); await refresh(); }
    catch (cause) { setError(cause instanceof Error ? cause.message : "Failed to disconnect account"); }
    finally { setActionLoading(null); }
  };
  return { accounts, isLoading, actionLoading, error, successMessage, connect, disconnect, isConnected: (p: OAuthProvider) => accounts.some((a) => a.provider === p), getAccountInfo: (p: OAuthProvider) => accounts.find((a) => a.provider === p) };
}
