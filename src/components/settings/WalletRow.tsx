"use client";

import { useState } from "react";
import { cn } from "@/lib/cn";
import { Icon, ICON_PATHS, LoadingSpinner } from "@/components/ui/Icon";
import { NEUMORPHIC_INSET, ACTION_BUTTON_DEFAULT, ACTION_BUTTON_DANGER } from "@/lib/styles";
import { WalletAddress } from "@/components/ui/WalletAddress";
import type { ConnectedWallet } from "@/lib/api/wallet-connect";

function formatDate(iso: string): string {
  const date = new Date(iso);
  return Number.isNaN(date.getTime())
    ? iso
    : date.toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });
}

export interface WalletRowProps {
  wallet: ConnectedWallet;
  busy: boolean;
  onSetPrimary: (wallet: ConnectedWallet) => void;
  onReconnect: (wallet: ConnectedWallet) => void;
  onDisconnect: (wallet: ConnectedWallet) => void;
}

export function WalletRow({
  wallet,
  busy,
  onSetPrimary,
  onReconnect,
  onDisconnect,
}: WalletRowProps): React.JSX.Element {
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

      <div className="flex flex-wrap gap-2">
        {wallet.isActive ? (
          <>
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
          </>
        ) : (
          <button
            type="button"
            disabled={busy}
            onClick={() => onReconnect(wallet)}
            aria-busy={busy}
            className={cn(ACTION_BUTTON_DEFAULT, "w-auto px-4 py-2 text-xs cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed")}
          >
            {busy ? <LoadingSpinner size="sm" /> : "Activate"}
          </button>
        )}
      </div>
    </div>
  );
}
