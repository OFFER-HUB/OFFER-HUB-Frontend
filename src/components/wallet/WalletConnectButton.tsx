"use client";

import { useEffect, useRef, useState } from "react";
import { StellarWalletsKit } from "@creit.tech/stellar-wallets-kit";
import { cn } from "@/lib/cn";
import { Icon, ICON_PATHS } from "@/components/ui/Icon";
import { StellarIcon } from "@/components/ui/StellarIcon";
import { WalletAddress } from "@/components/ui/WalletAddress";
import { WalletConnectModal } from "@/components/wallet/WalletConnectModal";
import { DROPDOWN_MENU, DROPDOWN_ITEM_DANGER } from "@/lib/styles";
import { useAuthStore } from "@/stores/auth-store";

export interface WalletConnectButtonProps {
  /**
   * `dropdown` anchors the wallet menu in a popover and suits the header bars.
   * `inline` stacks the same actions in normal flow, for the landing navbar's
   * mobile menu — that container is `overflow-hidden`, so it would clip an
   * absolutely positioned panel.
   */
  variant?: "dropdown" | "inline";
  className?: string;
}

const TRIGGER_BASE = cn(
  "flex items-center gap-2 rounded-xl font-semibold",
  "bg-white",
  "shadow-[4px_4px_8px_#d1d5db,-4px_-4px_8px_#ffffff]",
  "hover:shadow-[2px_2px_4px_#d1d5db,-2px_-2px_4px_#ffffff]",
  "active:shadow-[inset_2px_2px_4px_#d1d5db,inset_-2px_-2px_4px_#ffffff]",
  "focus-visible:ring-2 focus-visible:ring-primary/40 outline-none",
  "transition-all duration-200 cursor-pointer"
);

const STELLAR_BADGE = "w-5 h-5 rounded-lg bg-primary/10 flex items-center justify-center shrink-0";

/** Compact form the trigger shows: first four and last four characters. */
function truncateToEnds(address: string): string {
  if (address.length <= 8) return address;
  return `${address.slice(0, 4)}...${address.slice(-4)}`;
}

/**
 * Wallet entry point for the header bars.
 *
 * Disconnected it opens `WalletConnectModal`; connected it shows the truncated
 * public key and a menu holding the full address, a copy button and disconnect.
 */
export function WalletConnectButton({
  variant = "dropdown",
  className,
}: WalletConnectButtonProps): React.JSX.Element | null {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  const walletAddress = useAuthStore((state) => state.walletAddress);
  const walletConnected = useAuthStore((state) => state.walletConnected);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const hasHydrated = useAuthStore((state) => state.hasHydrated);
  const disconnectWallet = useAuthStore((state) => state.disconnectWallet);

  useEffect(() => {
    if (!isMenuOpen) return;

    function handleClickOutside(event: MouseEvent): void {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    }

    function handleKeyDown(event: KeyboardEvent): void {
      if (event.key === "Escape") {
        setIsMenuOpen(false);
        triggerRef.current?.focus();
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isMenuOpen]);

  async function handleDisconnect(): Promise<void> {
    try {
      await StellarWalletsKit.disconnect();
    } catch (error) {
      // The kit can have nothing left to tear down — an uninstalled extension,
      // storage cleared by the browser. The store still has to be cleared, so
      // this is reported rather than rethrown.
      console.error("Failed to disconnect the wallet from Stellar Wallets Kit:", error);
    }

    disconnectWallet();
    setIsMenuOpen(false);
  }

  function openModal(): void {
    setIsModalOpen(true);
  }

  function closeModal(): void {
    setIsModalOpen(false);
  }

  // Connecting a wallet links it to an account that is already signed in — the
  // API side (`POST /wallet/connect`) sits behind the JWT guard — so the entry
  // point only exists for an authenticated user.
  //
  // Auth state is unknown until AuthProvider rehydrates the store (created with
  // `skipHydration`), so nothing renders before that. No space is reserved: the
  // signed-out landing page is the common case and a placeholder there would be
  // a gap that never fills.
  if (!hasHydrated || !isAuthenticated) {
    return null;
  }

  const address = walletConnected ? walletAddress : null;

  if (variant === "inline") {
    return (
      <div className={cn("flex flex-col gap-3", className)}>
        {address === null ? (
          <button
            type="button"
            onClick={openModal}
            aria-haspopup="dialog"
            className={cn(TRIGGER_BASE, "w-full justify-center px-5 py-3 text-sm text-primary")}
          >
            <span className={STELLAR_BADGE}>
              <StellarIcon className="text-primary" />
            </span>
            Connect Wallet
          </button>
        ) : (
          <>
            <WalletAddress address={address} showFull className="w-full" />
            <button
              type="button"
              onClick={handleDisconnect}
              className={cn(TRIGGER_BASE, "w-full justify-center px-5 py-3 text-sm text-error")}
            >
              <Icon path={ICON_PATHS.logout} size="sm" />
              Disconnect
            </button>
          </>
        )}

        <WalletConnectModal isOpen={isModalOpen} onClose={closeModal} />
      </div>
    );
  }

  return (
    <div ref={containerRef} className={cn("relative", className)}>
      {address === null ? (
        <button
          type="button"
          ref={triggerRef}
          onClick={openModal}
          aria-haspopup="dialog"
          aria-label="Connect a Stellar wallet"
          className={cn(TRIGGER_BASE, "px-3 py-2.5 text-sm text-primary sm:px-4")}
        >
          <span className={STELLAR_BADGE}>
            <StellarIcon className="text-primary" />
          </span>
          <span className="hidden sm:inline">Connect Wallet</span>
        </button>
      ) : (
        <>
          <button
            type="button"
            ref={triggerRef}
            onClick={() => setIsMenuOpen((prev) => !prev)}
            aria-haspopup="dialog"
            aria-expanded={isMenuOpen}
            aria-label={`Wallet ${truncateToEnds(address)} connected. Open wallet menu`}
            className={cn(
              TRIGGER_BASE,
              "px-3 py-2.5 text-sm text-text-primary sm:px-4",
              isMenuOpen && "shadow-[inset_2px_2px_4px_#d1d5db,inset_-2px_-2px_4px_#ffffff]"
            )}
          >
            <span className={STELLAR_BADGE}>
              <StellarIcon className="text-primary" />
            </span>
            <span className="hidden font-mono font-medium sm:inline">
              {truncateToEnds(address)}
            </span>
            <Icon
              path={ICON_PATHS.chevronDown}
              size="sm"
              className={cn(
                "text-text-secondary transition-transform duration-200",
                isMenuOpen && "rotate-180"
              )}
            />
          </button>

          {isMenuOpen && (
            <div
              role="dialog"
              aria-label="Connected wallet"
              className={cn(DROPDOWN_MENU, "w-72 right-0 top-[calc(100%+0.75rem)]")}
            >
              <div className="px-4 pb-3 border-b border-background">
                <p className="text-xs text-text-secondary">Connected address</p>
                <div className="mt-2">
                  <WalletAddress address={address} showFull className="w-full" />
                </div>
              </div>

              <div className="pt-2">
                <button type="button" onClick={handleDisconnect} className={DROPDOWN_ITEM_DANGER}>
                  <div className="flex items-center gap-3">
                    <Icon path={ICON_PATHS.logout} size="sm" />
                    <span>Disconnect</span>
                  </div>
                </button>
              </div>
            </div>
          )}
        </>
      )}

      <WalletConnectModal isOpen={isModalOpen} onClose={closeModal} />
    </div>
  );
}
