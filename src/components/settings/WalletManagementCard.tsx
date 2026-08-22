"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/cn";
import { Icon, ICON_PATHS, LoadingSpinner } from "@/components/ui/Icon";
import { NEUMORPHIC_CARD, NEUMORPHIC_INSET, ACTION_BUTTON_DEFAULT, ACTION_BUTTON_DANGER } from "@/lib/styles";
import { WalletAddress } from "@/components/ui/WalletAddress";
import { useAuthStore } from "@/stores/auth-store";
import {
  listWallets,
  disconnectWallet as disconnectWalletApi,
  setPrimaryWalletApi,
  ConnectWalletError,
  type ConnectedWallet,
} from "@/lib/api/wallet-connect";

function formatDate(iso: string): string {
  const date = new Date(iso);
  return Number.isNaN(date.getTime())
    ? iso
    : date.toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });
}

interface WalletRowProps {
  wallet: ConnectedWallet;
  busy: boolean;
  onSetPrimary: (wallet: ConnectedWallet) => void;
  onDisconnect: (wallet: ConnectedWallet) => void;
}

function WalletRow({ wallet, busy, onSetPrimary, onDisconnect }: WalletRowProps): React.JSX.Element {
  const [confirmingDisconnect, setConfirmingDisconnect] = useState(false);

  return (
    <div className={cn(NEUMORPHIC_INSET, "rounded-2xl p-4 flex flex-col gap-3")}>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <WalletAddress address={wallet.publicKey} />
        <div className="flex items-center gap-2">
          {wallet.isPrimary && (
            <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2.5 py-1 text-xs font-semibold text-primary">
              <Icon path={ICON_PATHS.star} size="sm" />
              Primary
            </span>
          )}
          <span
            className={cn(
              "rounded-full px-2.5 py-1 text-xs font-semibold",
              wallet.isActive ? "bg-success/10 text-success" : "bg-text-secondary/10 text-text-secondary"
            )}
          >
            {wallet.isActive ? "Active" : "Disconnected"}
          </span>
        </div>
      </div>

      <p className="text-xs text-text-secondary">Connected {formatDate(wallet.createdAt)}</p>

      {wallet.isActive && (
        <div className="flex flex-wrap gap-2">
          {!wallet.isPrimary && (
            <button
              type="button"
              disabled={busy}
              onClick={() => onSetPrimary(wallet)}
              className={cn(ACTION_BUTTON_DEFAULT, "w-auto px-4 py-2 text-xs cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed")}
            >
              Set as primary
            </button>
          )}

          {confirmingDisconnect ? (
            <>
              <button
                type="button"
                disabled={busy}
                onClick={() => onDisconnect(wallet)}
                aria-busy={busy}
                className={cn(ACTION_BUTTON_DANGER, "w-auto px-4 py-2 text-xs disabled:opacity-50 disabled:cursor-not-allowed")}
              >
                {busy ? <LoadingSpinner size="sm" /> : "Confirm disconnect"}
              </button>
              <button
                type="button"
                disabled={busy}
                onClick={() => setConfirmingDisconnect(false)}
                className="px-4 py-2 text-xs font-medium text-text-secondary cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Cancel
              </button>
            </>
          ) : (
            <button
              type="button"
              disabled={busy}
              onClick={() => setConfirmingDisconnect(true)}
              className={cn(ACTION_BUTTON_DANGER, "w-auto px-4 py-2 text-xs cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed")}
            >
              Disconnect
            </button>
          )}
        </div>
      )}
    </div>
  );
}

/**
 * Full wallet history for the account: every wallet ever connected, active or
 * not, with actions to switch primary or disconnect. Rows are never deleted
 * server-side, so this is where that history becomes visible instead of the
 * app only ever showing "your current wallet".
 */
export function WalletManagementCard(): React.JSX.Element {
  const token = useAuthStore((state) => state.token);
  const setPrimaryWallet = useAuthStore((state) => state.setPrimaryWallet);
  // Connecting or disconnecting elsewhere (the header button, the connect
  // modal, the claim flow) updates this. Keying the fetch off it, instead of
  // fetching once on mount, is what keeps this list in sync without the user
  // having to reload the page.
  const primaryWalletId = useAuthStore((state) => state.user?.wallet?.id ?? null);

  const [wallets, setWallets] = useState<ConnectedWallet[] | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [busyWalletId, setBusyWalletId] = useState<string | null>(null);

  useEffect(() => {
    if (!token) return;
    let cancelled = false;

    listWallets(token)
      .then((result) => {
        if (!cancelled) setWallets(result);
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        setLoadError(err instanceof ConnectWalletError ? err.message : "Could not load your wallets.");
      });

    return () => {
      cancelled = true;
    };
  }, [token, primaryWalletId]);

  async function handleSetPrimary(wallet: ConnectedWallet): Promise<void> {
    if (!token) return;
    setActionError(null);
    setBusyWalletId(wallet.id);
    try {
      const updated = await setPrimaryWalletApi(token, wallet.id);
      setWallets(updated);
      const primary = updated.find((w) => w.isPrimary);
      setPrimaryWallet(primary ? { id: primary.id, publicKey: primary.publicKey, type: primary.type } : undefined);
    } catch (err) {
      setActionError(err instanceof ConnectWalletError ? err.message : "Could not set this wallet as primary.");
    } finally {
      setBusyWalletId(null);
    }
  }

  async function handleDisconnect(wallet: ConnectedWallet): Promise<void> {
    if (!token) return;
    setActionError(null);
    setBusyWalletId(wallet.id);
    try {
      const updated = await disconnectWalletApi(token, wallet.id);
      setWallets(updated);
      // Disconnecting the primary does not auto-promote another one.
      if (wallet.isPrimary) setPrimaryWallet(undefined);
    } catch (err) {
      setActionError(err instanceof ConnectWalletError ? err.message : "Could not disconnect this wallet.");
    } finally {
      setBusyWalletId(null);
    }
  }

  return (
    <div className={NEUMORPHIC_CARD}>
      <h2 className="text-lg font-semibold text-text-primary mb-1 flex items-center gap-2">
        <Icon path={ICON_PATHS.list} size="md" className="text-primary" />
        Your wallets
      </h2>
      <p className="text-sm text-text-secondary mb-5">
        Every wallet you have connected, including ones you have disconnected.
      </p>

      {loadError !== null ? (
        <p role="alert" className="text-sm text-error">{loadError}</p>
      ) : wallets === null ? (
        <div role="status" className="flex items-center justify-center gap-2.5 py-8 text-sm text-text-secondary">
          <LoadingSpinner size="sm" />
          Loading wallets...
        </div>
      ) : wallets.length === 0 ? (
        <p className="text-sm text-text-secondary">You have not connected a wallet yet.</p>
      ) : (
        <div className="space-y-3">
          {wallets.map((wallet) => (
            <WalletRow
              key={wallet.id}
              wallet={wallet}
              busy={busyWalletId === wallet.id}
              onSetPrimary={handleSetPrimary}
              onDisconnect={handleDisconnect}
            />
          ))}
        </div>
      )}

      {actionError !== null && (
        <p role="alert" className="mt-3 text-sm text-error">{actionError}</p>
      )}
    </div>
  );
}
