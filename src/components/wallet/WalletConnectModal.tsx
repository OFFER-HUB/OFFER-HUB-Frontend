"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { StellarWalletsKit, type ISupportedWallet } from "@creit.tech/stellar-wallets-kit";
import { cn } from "@/lib/cn";
import { Icon, ICON_PATHS, LoadingSpinner } from "@/components/ui/Icon";
import { NEUMORPHIC_CARD, NEUMORPHIC_INSET } from "@/lib/styles";
import { useWalletKit } from "@/hooks/use-wallet-kit";
import { useAuthStore } from "@/stores/auth-store";

export interface WalletConnectModalProps {
  isOpen: boolean;
  onClose: () => void;
  /** Called with the public key once a wallet is connected. */
  onConnected?: (address: string) => void;
}

/**
 * SWK rejects with plain `{ code, message }` objects rather than Errors, so a
 * normal `instanceof Error` check would swallow the useful part.
 */
function toErrorMessage(error: unknown, fallback: string): string {
  if (error instanceof Error) {
    return error.message;
  }

  if (typeof error === "object" && error !== null && "message" in error) {
    const { message } = error as { message: unknown };
    if (typeof message === "string" && message.length > 0) {
      return message;
    }
  }

  return fallback;
}

function truncateAddress(address: string): string {
  return `${address.slice(0, 6)}…${address.slice(-6)}`;
}

export function WalletConnectModal({
  isOpen,
  onClose,
  onConnected,
}: WalletConnectModalProps): React.JSX.Element | null {
  const { address, network } = useWalletKit();
  const setWalletAddress = useAuthStore((state) => state.setWalletAddress);

  const [wallets, setWallets] = useState<ISupportedWallet[] | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [connectingId, setConnectingId] = useState<string | null>(null);
  const [connectError, setConnectError] = useState<string | null>(null);

  const dialogRef = useRef<HTMLDivElement>(null);

  // Availability is probed live (each module answers within 1s or is reported
  // unavailable), so the list is refreshed every time the modal opens rather
  // than cached — a user may install a wallet without reloading the page.
  useEffect(() => {
    if (!isOpen) {
      return;
    }

    let isCancelled = false;

    StellarWalletsKit.refreshSupportedWallets()
      .then((supported) => {
        if (!isCancelled) {
          setWallets(supported);
          setLoadError(null);
        }
      })
      .catch((error: unknown) => {
        if (!isCancelled) {
          setLoadError(toErrorMessage(error, "Could not load the wallet list."));
        }
      });

    return () => {
      isCancelled = true;
    };
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        onClose();
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    dialogRef.current?.focus();

    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) {
    return null;
  }

  async function handleConnect(wallet: ISupportedWallet) {
    if (!wallet.isAvailable) {
      window.open(wallet.url, "_blank", "noopener,noreferrer");
      return;
    }

    setConnectingId(wallet.id);
    setConnectError(null);

    try {
      StellarWalletsKit.setWallet(wallet.id);

      // `getAddress` only reads the kit's memory and throws when nothing is
      // connected yet, so a first-time connection has to go to the wallet.
      const { address: connected } = await StellarWalletsKit.fetchAddress();

      setWalletAddress(connected);
      onConnected?.(connected);
      onClose();
    } catch (error) {
      setConnectError(
        toErrorMessage(error, `Could not connect to ${wallet.name}. Please try again.`),
      );
    } finally {
      setConnectingId(null);
    }
  }

  async function handleDisconnect() {
    await StellarWalletsKit.disconnect();
    setWalletAddress(null);
  }

  const isConnecting = connectingId !== null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <button
        type="button"
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
        aria-label="Close wallet connection dialog"
        disabled={isConnecting}
      />

      <div
        ref={dialogRef}
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
        aria-labelledby="wallet-connect-title"
        aria-describedby="wallet-connect-description"
        className={cn(
          NEUMORPHIC_CARD,
          "relative w-full max-w-md max-h-[90vh] overflow-y-auto p-5 sm:p-6 outline-none",
        )}
      >
        <button
          type="button"
          onClick={onClose}
          disabled={isConnecting}
          className={cn(
            "absolute top-4 right-4 p-2 rounded-lg text-text-secondary",
            "hover:text-text-primary hover:bg-background transition-colors",
            "disabled:opacity-40 disabled:cursor-not-allowed",
          )}
          aria-label="Close"
        >
          <Icon path={ICON_PATHS.close} size="md" />
        </button>

        <div className="pr-10">
          <h2 id="wallet-connect-title" className="text-xl font-bold text-text-primary">
            Connect a wallet
          </h2>
          <p id="wallet-connect-description" className="text-sm text-text-secondary mt-1">
            {address
              ? "Your Stellar wallet is connected."
              : `Choose a Stellar wallet to connect on ${network}.`}
          </p>
        </div>

        {address ? (
          <div className="mt-5 space-y-4">
            <div className={cn(NEUMORPHIC_INSET, "rounded-2xl p-4")}>
              <p className="text-xs text-text-secondary">Connected address</p>
              <p className="mt-1 font-mono text-sm font-semibold text-text-primary break-all">
                {truncateAddress(address)}
              </p>
            </div>

            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={handleDisconnect}
                className={cn(
                  "px-5 py-2.5 rounded-xl text-sm font-medium",
                  "text-text-secondary hover:text-text-primary",
                  "bg-background transition-colors",
                )}
              >
                Disconnect
              </button>
              <button
                type="button"
                onClick={onClose}
                className={cn(
                  "px-5 py-2.5 rounded-xl text-sm font-medium text-white bg-primary",
                  "shadow-[4px_4px_8px_#d1d5db,-4px_-4px_8px_#ffffff]",
                )}
              >
                Done
              </button>
            </div>
          </div>
        ) : (
          <div className="mt-5">
            {loadError ? (
              <div
                role="alert"
                className="p-4 rounded-2xl bg-error/10 border border-error/20 text-sm text-error"
              >
                {loadError}
              </div>
            ) : wallets === null ? (
              <div
                role="status"
                aria-live="polite"
                className="flex items-center justify-center gap-2 py-8 text-sm text-text-secondary"
              >
                <LoadingSpinner size="sm" />
                Loading wallets...
              </div>
            ) : (
              <ul className="space-y-3">
                {wallets.map((wallet) => {
                  const isThisConnecting = connectingId === wallet.id;

                  return (
                    <li key={wallet.id}>
                      <button
                        type="button"
                        onClick={() => handleConnect(wallet)}
                        disabled={isConnecting}
                        aria-busy={isThisConnecting}
                        aria-label={
                          wallet.isAvailable
                            ? `Connect ${wallet.name}`
                            : `Install ${wallet.name} (opens in a new tab)`
                        }
                        className={cn(
                          "w-full flex items-center gap-3 px-4 py-3.5 rounded-xl bg-white text-left",
                          "shadow-[4px_4px_8px_#d1d5db,-4px_-4px_8px_#ffffff]",
                          "hover:shadow-[2px_2px_4px_#d1d5db,-2px_-2px_4px_#ffffff]",
                          "active:shadow-[inset_2px_2px_4px_#d1d5db,inset_-2px_-2px_4px_#ffffff]",
                          "focus-visible:ring-2 focus-visible:ring-primary/40 outline-none",
                          "transition-all duration-200",
                          "disabled:opacity-50 disabled:cursor-not-allowed",
                        )}
                      >
                        <Image
                          src={wallet.icon}
                          alt=""
                          width={32}
                          height={32}
                          className="w-8 h-8 rounded-lg shrink-0"
                        />

                        <span className="flex-1 min-w-0">
                          <span className="block font-semibold text-text-primary truncate">
                            {wallet.name}
                          </span>
                          {!wallet.isAvailable ? (
                            <span className="block text-xs text-text-secondary">Not installed</span>
                          ) : null}
                        </span>

                        {isThisConnecting ? (
                          <LoadingSpinner size="sm" />
                        ) : wallet.isAvailable ? (
                          <Icon
                            path={ICON_PATHS.chevronRight}
                            size="sm"
                            className="text-text-secondary shrink-0"
                          />
                        ) : (
                          <span className="text-xs font-medium text-primary shrink-0">Install</span>
                        )}
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}

            {connectError ? (
              <div
                role="alert"
                className="mt-4 p-3 rounded-xl bg-error/10 border border-error/20 text-xs text-error"
              >
                {connectError}
              </div>
            ) : null}
          </div>
        )}
      </div>
    </div>
  );
}
