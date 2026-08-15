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

function StellarIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.562 7.29l-1.032.476a.28.28 0 01-.232-.01L7.08 4.416a.14.14 0 00-.194.13v1.048l9.26 4.264-.621.286-9.26-4.264v1.048l9.26 4.264-.621.286-9.26-4.264v1.47c0 .306.172.587.447.727l8.35 4.154a1.12 1.12 0 001.002-.014l1.119-.515V7.29z" />
    </svg>
  );
}

export function WalletConnectModal({
  isOpen,
  onClose,
  onConnected,
}: WalletConnectModalProps): React.JSX.Element | null {
  const { address, network } = useWalletKit();
  const connectWallet = useAuthStore((state) => state.connectWallet);
  const disconnectWallet = useAuthStore((state) => state.disconnectWallet);

  const [wallets, setWallets] = useState<ISupportedWallet[] | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [connectingId, setConnectingId] = useState<string | null>(null);
  const [connectError, setConnectError] = useState<string | null>(null);

  const dialogRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;
    let isCancelled = false;
    StellarWalletsKit.refreshSupportedWallets()
      .then((supported) => {
        if (!isCancelled) { setWallets(supported); setLoadError(null); }
      })
      .catch((error: unknown) => {
        if (!isCancelled) setLoadError(toErrorMessage(error, "Could not load the wallet list."));
      });
    return () => { isCancelled = true; };
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    function handleKeyDown(e: KeyboardEvent) { if (e.key === "Escape") onClose(); }
    window.addEventListener("keydown", handleKeyDown);
    dialogRef.current?.focus();
    return () => window.removeEventListener("keydown", handleKeyDown);
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
    } catch (error) {
      setConnectError(toErrorMessage(error, `Could not connect to ${wallet.name}. Please try again.`));
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
      {/* Backdrop */}
      <button
        type="button"
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
        aria-label="Close wallet connection dialog"
        disabled={isConnecting}
      />

      {/* Modal */}
      <div
        ref={dialogRef}
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
        aria-labelledby="wallet-connect-title"
        aria-describedby="wallet-connect-description"
        className={cn(
          "relative w-full max-w-sm outline-none overflow-hidden",
          "rounded-2xl bg-[#F3F4F6]",
          "shadow-[12px_12px_24px_#c8ccd4,-12px_-12px_24px_#ffffff]",
          "animate-scale-in",
        )}
      >
        {/* Gradient header band */}
        <div className="relative px-6 pt-6 pb-5 bg-gradient-to-br from-[#149A9B] to-[#002333] overflow-hidden">
          {/* Decorative circles */}
          <span className="absolute -top-8 -right-8 w-32 h-32 rounded-full bg-white/5" />
          <span className="absolute -bottom-4 -left-4 w-20 h-20 rounded-full bg-white/5" />

          {/* Close button */}
          <button
            type="button"
            onClick={onClose}
            disabled={isConnecting}
            className={cn(
              "absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-lg",
              "text-white/70 hover:text-white hover:bg-white/10 transition-colors",
              "disabled:opacity-40 disabled:cursor-not-allowed",
            )}
            aria-label="Close"
          >
            <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </button>

          {/* Icon + title */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/15 flex items-center justify-center shrink-0">
              <StellarIcon className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 id="wallet-connect-title" className="text-base font-bold text-white leading-tight">
                {address ? "Wallet connected" : "Connect a wallet"}
              </h2>
              <p id="wallet-connect-description" className="text-xs text-white/60 mt-0.5">
                {address
                  ? "Manage your Stellar wallet connection"
                  : "Select a Stellar wallet to continue"}
              </p>
            </div>
          </div>

          {/* Network badge */}
          <span className="mt-4 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/10 border border-white/20">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-[10px] font-semibold text-white/80 uppercase tracking-wider">
              {network}
            </span>
          </span>
        </div>

        {/* Body */}
        <div className="p-5">
          {address ? (
            <div className="space-y-4">
              {/* Connected address card */}
              <div className={cn(
                "rounded-xl p-4",
                "bg-[#F3F4F6] shadow-[inset_3px_3px_6px_#d1d5db,inset_-3px_-3px_6px_#ffffff]",
              )}>
                <div className="flex items-center gap-2 mb-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  <p className="text-[10px] font-semibold text-text-secondary uppercase tracking-wider">
                    Connected address
                  </p>
                </div>
                <p className="font-mono text-sm font-semibold text-text-primary break-all">
                  {truncateAddress(address)}
                </p>
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={handleDisconnect}
                  className={cn(
                    "flex-1 px-4 py-2.5 rounded-xl text-sm font-medium",
                    "text-text-secondary bg-[#F3F4F6]",
                    "shadow-[3px_3px_6px_#d1d5db,-3px_-3px_6px_#ffffff]",
                    "hover:text-error active:shadow-[inset_2px_2px_4px_#d1d5db,inset_-2px_-2px_4px_#ffffff]",
                    "transition-all duration-200 cursor-pointer",
                  )}
                >
                  Disconnect
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  className={cn(
                    "flex-1 px-4 py-2.5 rounded-xl text-sm font-medium text-white",
                    "bg-primary",
                    "shadow-[4px_4px_8px_#d1d5db,-4px_-4px_8px_#ffffff]",
                    "hover:bg-primary-hover hover:scale-[1.02]",
                    "active:scale-[0.98] active:shadow-[inset_3px_3px_6px_rgba(0,0,0,0.2)]",
                    "transition-all duration-200 cursor-pointer",
                  )}
                >
                  Done
                </button>
              </div>
            </div>
          ) : (
            <>
              {loadError ? (
                <div
                  role="alert"
                  className="p-4 rounded-xl bg-error/10 border border-error/20 text-sm text-error"
                >
                  {loadError}
                </div>
              ) : wallets === null ? (
                <div
                  role="status"
                  aria-live="polite"
                  className="flex flex-col items-center justify-center gap-3 py-10"
                >
                  <LoadingSpinner size="md" />
                  <p className="text-sm text-text-secondary">Detecting wallets…</p>
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
                          aria-label={
                            available
                              ? `Connect ${wallet.name}`
                              : `Install ${wallet.name} (opens in a new tab)`
                          }
                          className={cn(
                            "group w-full flex items-center gap-3.5 px-4 py-3.5 rounded-xl text-left",
                            "bg-[#F3F4F6] transition-all duration-200 outline-none",
                            available
                              ? [
                                  "shadow-[4px_4px_8px_#d1d5db,-4px_-4px_8px_#ffffff]",
                                  "hover:shadow-[6px_6px_12px_#d1d5db,-6px_-6px_12px_#ffffff] hover:-translate-y-0.5",
                                  "active:shadow-[inset_3px_3px_6px_#d1d5db,inset_-3px_-3px_6px_#ffffff] active:translate-y-0",
                                ]
                              : [
                                  "shadow-[2px_2px_4px_#d1d5db,-2px_-2px_4px_#ffffff] opacity-60",
                                  "hover:opacity-80",
                                ],
                            "focus-visible:ring-2 focus-visible:ring-primary/40",
                            "disabled:cursor-not-allowed",
                          )}
                        >
                          {/* Wallet icon */}
                          <div className={cn(
                            "w-10 h-10 rounded-xl shrink-0 flex items-center justify-center overflow-hidden",
                            available
                              ? "shadow-[2px_2px_4px_#d1d5db,-2px_-2px_4px_#ffffff]"
                              : "opacity-60",
                          )}>
                            <Image
                              src={wallet.icon}
                              alt=""
                              width={40}
                              height={40}
                              className="w-10 h-10 object-cover"
                            />
                          </div>

                          {/* Label */}
                          <div className="flex-1 min-w-0">
                            <span className={cn(
                              "block font-semibold text-sm truncate",
                              available ? "text-text-primary" : "text-text-secondary",
                            )}>
                              {wallet.name}
                            </span>
                            <span className="block text-[11px] text-text-secondary mt-0.5">
                              {available ? "Ready to connect" : "Not installed"}
                            </span>
                          </div>

                          {/* Right indicator */}
                          <div className="shrink-0">
                            {isThisConnecting ? (
                              <LoadingSpinner size="sm" />
                            ) : available ? (
                              <span className={cn(
                                "flex items-center justify-center w-7 h-7 rounded-lg",
                                "bg-primary/10 text-primary",
                                "group-hover:bg-primary group-hover:text-white",
                                "transition-all duration-200",
                              )}>
                                <svg viewBox="0 0 16 16" fill="currentColor" className="w-3.5 h-3.5">
                                  <path fillRule="evenodd" d="M6.22 3.22a.75.75 0 011.06 0l4.25 4.25a.75.75 0 010 1.06l-4.25 4.25a.75.75 0 01-1.06-1.06L9.94 8 6.22 4.28a.75.75 0 010-1.06z" clipRule="evenodd" />
                                </svg>
                              </span>
                            ) : (
                              <span className={cn(
                                "text-[11px] font-semibold px-2.5 py-1 rounded-lg",
                                "bg-primary/10 text-primary",
                              )}>
                                Install
                              </span>
                            )}
                          </div>
                        </button>
                      </li>
                    );
                  })}
                </ul>
              )}

              {connectError ? (
                <div
                  role="alert"
                  className="mt-3 p-3 rounded-xl bg-error/10 border border-error/20 text-xs text-error"
                >
                  {connectError}
                </div>
              ) : null}

              {/* Footer security note */}
              {wallets !== null && !loadError && (
                <p className="mt-4 text-center text-[11px] text-text-secondary leading-relaxed">
                  <svg viewBox="0 0 16 16" fill="currentColor" className="inline w-3 h-3 mr-1 opacity-60">
                    <path fillRule="evenodd" d="M8 1a3.5 3.5 0 00-3.5 3.5V7A1.5 1.5 0 003 8.5v4A1.5 1.5 0 004.5 14h7a1.5 1.5 0 001.5-1.5v-4A1.5 1.5 0 0011.5 7V4.5A3.5 3.5 0 008 1zm2 6V4.5a2 2 0 10-4 0V7h4z" clipRule="evenodd" />
                  </svg>
                  Your private keys never leave your wallet
                </p>
              )}
            </>
          )}
        </div>
      </div>
    </div>,
    document.body,
  );
}
