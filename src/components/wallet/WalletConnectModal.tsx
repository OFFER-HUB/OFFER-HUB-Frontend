"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import { StellarWalletsKit, type ISupportedWallet } from "@creit.tech/stellar-wallets-kit";
import { cn } from "@/lib/cn";
import { LoadingSpinner } from "@/components/ui/Icon";
import { useWalletKit } from "@/hooks/use-wallet-kit";
import { useAuthStore } from "@/stores/auth-store";

export interface WalletConnectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConnected?: (address: string) => void;
}

function toErrorMessage(error: unknown, fallback: string): string {
  if (error instanceof Error) return error.message;
  if (typeof error === "object" && error !== null && "message" in error) {
    const { message } = error as { message: unknown };
    if (typeof message === "string" && message.length > 0) return message;
  }
  return fallback;
}

function truncateAddress(address: string): string {
  return `${address.slice(0, 8)}…${address.slice(-8)}`;
}

export function WalletConnectModal({
  isOpen,
  onClose,
  onConnected,
}: WalletConnectModalProps): React.JSX.Element | null {
  const { address } = useWalletKit();
  const connectWallet = useAuthStore((state) => state.connectWallet);
  const disconnectWallet = useAuthStore((state) => state.disconnectWallet);

  const [wallets, setWallets] = useState<ISupportedWallet[] | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [connectingId, setConnectingId] = useState<string | null>(null);
  const [connectError, setConnectError] = useState<string | null>(null);

  const dialogRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;
    let cancelled = false;
    StellarWalletsKit.refreshSupportedWallets()
      .then((supported) => { if (!cancelled) { setWallets(supported); setLoadError(null); } })
      .catch((err: unknown) => { if (!cancelled) setLoadError(toErrorMessage(err, "Could not load wallets.")); });
    return () => { cancelled = true; };
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", handler);
    dialogRef.current?.focus();
    return () => window.removeEventListener("keydown", handler);
  }, [isOpen, onClose]);

  if (!isOpen || typeof document === "undefined") return null;

  async function handleConnect(wallet: ISupportedWallet) {
    if (!wallet.isAvailable) {
      window.open(wallet.url, "_blank", "noopener,noreferrer");
      return;
    }
    setConnectingId(wallet.id);
    setConnectError(null);
    try {
      StellarWalletsKit.setWallet(wallet.id);
      const { address: connected } = await StellarWalletsKit.fetchAddress();
      connectWallet(connected);
      onConnected?.(connected);
      onClose();
    } catch (err) {
      setConnectError(toErrorMessage(err, `Could not connect to ${wallet.name}. Please try again.`));
    } finally {
      setConnectingId(null);
    }
  }

  async function handleDisconnect() {
    await StellarWalletsKit.disconnect();
    disconnectWallet();
  }

  const isConnecting = connectingId !== null;

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <button
        type="button"
        className="absolute inset-0 bg-black/30 backdrop-blur-sm"
        onClick={onClose}
        aria-label="Close"
        disabled={isConnecting}
      />

      <div
        ref={dialogRef}
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
        aria-labelledby="wc-title"
        className={cn(
          "relative w-full max-w-sm outline-none",
          "bg-white rounded-2xl p-6",
          "shadow-[8px_8px_16px_#d1d5db,-8px_-8px_16px_#ffffff]",
          "animate-scale-in",
        )}
      >
        {/* Header */}
        <div className="flex items-start justify-between mb-5">
          <div>
            <h2 id="wc-title" className="text-lg font-bold text-text-primary">
              {address ? "Wallet connected" : "Connect wallet"}
            </h2>
            <p className="text-sm text-text-secondary mt-0.5">
              {address ? "Your Stellar wallet is active" : "Choose a wallet to sign in securely"}
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={isConnecting}
            aria-label="Close"
            className={cn(
              "w-9 h-9 flex items-center justify-center rounded-xl shrink-0 ml-3",
              "text-text-secondary bg-white",
              "shadow-[3px_3px_6px_#d1d5db,-3px_-3px_6px_#ffffff]",
              "hover:text-text-primary",
              "active:shadow-[inset_2px_2px_4px_#d1d5db,inset_-2px_-2px_4px_#ffffff]",
              "transition-all duration-150 disabled:opacity-40 disabled:cursor-not-allowed",
            )}
          >
            <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </button>
        </div>

        {/* Divider */}
        <div className="h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent mb-5" />

        {/* Content */}
        {address ? (
          <div className="space-y-4">
            <div className="rounded-xl p-4 shadow-[inset_3px_3px_6px_#d1d5db,inset_-3px_-3px_6px_#ffffff]">
              <p className="text-xs font-medium text-text-secondary mb-1.5">Connected address</p>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
                <p className="font-mono text-sm font-semibold text-text-primary truncate">
                  {truncateAddress(address)}
                </p>
              </div>
            </div>

            <div className="flex gap-3 pt-1">
              <button
                type="button"
                onClick={handleDisconnect}
                className={cn(
                  "flex-1 py-2.5 rounded-xl text-sm font-medium",
                  "text-text-secondary bg-white",
                  "shadow-[3px_3px_6px_#d1d5db,-3px_-3px_6px_#ffffff]",
                  "hover:text-error active:shadow-[inset_2px_2px_4px_#d1d5db,inset_-2px_-2px_4px_#ffffff]",
                  "transition-all duration-150 cursor-pointer",
                )}
              >
                Disconnect
              </button>
              <button
                type="button"
                onClick={onClose}
                className={cn(
                  "flex-1 py-2.5 rounded-xl text-sm font-medium text-white",
                  "bg-primary",
                  "shadow-[4px_4px_8px_#d1d5db,-4px_-4px_8px_#ffffff]",
                  "hover:bg-primary-hover hover:scale-[1.02]",
                  "active:scale-[0.98]",
                  "transition-all duration-150 cursor-pointer",
                )}
              >
                Done
              </button>
            </div>
          </div>
        ) : (
          <>
            {loadError ? (
              <p role="alert" className="text-sm text-error text-center py-4">{loadError}</p>
            ) : wallets === null ? (
              <div role="status" className="flex items-center justify-center gap-2.5 py-10 text-sm text-text-secondary">
                <LoadingSpinner size="sm" />
                Detecting wallets…
              </div>
            ) : (
              <ul className="space-y-2.5">
                {wallets.map((wallet) => {
                  const isThisConnecting = connectingId === wallet.id;
                  const available = wallet.isAvailable;

                  return (
                    <li key={wallet.id}>
                      <button
                        type="button"
                        onClick={() => handleConnect(wallet)}
                        disabled={isConnecting}
                        aria-busy={isThisConnecting}
                        aria-label={available ? `Connect ${wallet.name}` : `Install ${wallet.name}`}
                        className={cn(
                          "w-full flex items-center gap-3.5 px-4 py-3.5 rounded-xl text-left",
                          "bg-white transition-all duration-150 outline-none cursor-pointer",
                          "focus-visible:ring-2 focus-visible:ring-primary/30",
                          available
                            ? [
                                "shadow-[4px_4px_8px_#d1d5db,-4px_-4px_8px_#ffffff]",
                                "hover:shadow-[6px_6px_12px_#d1d5db,-6px_-6px_12px_#ffffff]",
                                "active:shadow-[inset_3px_3px_6px_#d1d5db,inset_-3px_-3px_6px_#ffffff]",
                              ]
                            : "shadow-[2px_2px_4px_#d1d5db,-2px_-2px_4px_#ffffff] opacity-55",
                          "disabled:cursor-not-allowed",
                        )}
                      >
                        <Image
                          src={wallet.icon}
                          alt=""
                          width={40}
                          height={40}
                          className="w-10 h-10 rounded-xl shrink-0"
                        />

                        <div className="flex-1 min-w-0">
                          <p className={cn(
                            "font-semibold text-sm truncate",
                            available ? "text-text-primary" : "text-text-secondary",
                          )}>
                            {wallet.name}
                          </p>
                          <p className="text-xs text-text-secondary mt-0.5">
                            {available ? "Available" : "Not installed"}
                          </p>
                        </div>

                        <div className="shrink-0 ml-1">
                          {isThisConnecting ? (
                            <LoadingSpinner size="sm" />
                          ) : available ? (
                            <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 text-text-secondary">
                              <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                            </svg>
                          ) : (
                            <span className="text-xs font-semibold text-primary">Install</span>
                          )}
                        </div>
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}

            {connectError && (
              <p role="alert" className="mt-3 text-xs text-error text-center">{connectError}</p>
            )}

            {wallets !== null && !loadError && (
              <p className="mt-5 text-center text-xs text-text-secondary">
                Your private keys never leave your wallet
              </p>
            )}
          </>
        )}
      </div>
    </div>,
    document.body,
  );
}
