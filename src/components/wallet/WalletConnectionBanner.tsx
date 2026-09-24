"use client";

/**
 * WalletConnectionBanner (#362)
 *
 * OfferHub no longer creates a custodial wallet on registration (#180) —
 * email/password and OAuth accounts can reach the dashboard with no wallet
 * at all. This surfaces a dashboard/profile-wide reminder to connect one,
 * modeled on `EmailVerificationBanner`'s dismiss behavior: dismissing hides
 * it for the current browser session (`sessionStorage`), and it reappears
 * on the next login/reload as long as the account still has no primary
 * wallet — a nudge, not a one-time toast.
 *
 * This is the passive half of the requirement. The hard block on
 * money-moving actions is server-side (`WalletRequiredGuard`, #181) and
 * should surface its own `WALLET_REQUIRED` error at the point of action.
 */

import { useCallback, useEffect, useState } from "react";
import { Icon, ICON_PATHS } from "@/components/ui/Icon";
import { StellarIcon } from "@/components/ui/StellarIcon";
import { WalletConnectModal } from "@/components/wallet/WalletConnectModal";
import { cn } from "@/lib/cn";

export interface WalletConnectionBannerProps {
  /** Stable user identifier — keys the per-session dismissal flag. */
  userId: string;
  /** True when the account already has a primary wallet — the banner does not render. */
  hasWallet: boolean;
  className?: string;
}

const STORAGE_PREFIX = "offerhub:wallet-connection-banner-dismissed:";

const dismissalKey = (userId: string) => `${STORAGE_PREFIX}${userId}`;

const readDismissed = (userId: string): boolean => {
  if (typeof window === "undefined") return false;
  try {
    return window.sessionStorage.getItem(dismissalKey(userId)) === "1";
  } catch {
    // sessionStorage can throw in private modes / strict CSP — the safer
    // failure mode for a reminder like this is to keep showing it.
    return false;
  }
};

const writeDismissed = (userId: string) => {
  if (typeof window === "undefined") return;
  try {
    window.sessionStorage.setItem(dismissalKey(userId), "1");
  } catch {
    /* see readDismissed — swallow and continue. */
  }
};

export function WalletConnectionBanner({
  userId,
  hasWallet,
  className,
}: WalletConnectionBannerProps) {
  const [dismissed, setDismissed] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Re-read on mount + whenever the userId changes, covering an in-tab
  // account switch the same way EmailVerificationBanner does.
  useEffect(() => {
    setDismissed(readDismissed(userId));
  }, [userId]);

  const handleDismiss = useCallback(() => {
    writeDismissed(userId);
    setDismissed(true);
  }, [userId]);

  if (hasWallet || dismissed) return null;

  return (
    <>
      <div
        role="status"
        aria-live="polite"
        data-testid="wallet-connection-banner"
        className={cn(
          "flex flex-col gap-3 rounded-2xl bg-white p-4 shadow-[var(--shadow-neumorphic-light)] sm:flex-row sm:items-center sm:justify-between",
          className
        )}
      >
        <div className="flex items-start gap-3 sm:items-center">
          <span
            aria-hidden="true"
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary"
          >
            <StellarIcon />
          </span>
          <div className="min-w-0">
            <p className="font-semibold text-text-primary">Connect your wallet</p>
            <p className="text-sm text-text-secondary">
              Add a Stellar wallet to complete your profile and unlock payments.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setIsModalOpen(true)}
            className="inline-flex items-center gap-2 rounded-xl bg-primary px-3 py-2 text-sm font-semibold text-white shadow-sm transition-opacity hover:bg-primary-hover focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/70"
          >
            <StellarIcon className="text-white" />
            Connect wallet
          </button>
          <button
            type="button"
            onClick={handleDismiss}
            aria-label="Dismiss wallet reminder for this session"
            data-testid="wallet-connection-banner-dismiss"
            className="inline-flex h-9 w-9 items-center justify-center rounded-xl text-text-secondary transition-colors hover:bg-background hover:text-text-primary focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/60"
          >
            <Icon path={ICON_PATHS.x} size="sm" />
          </button>
        </div>
      </div>

      <WalletConnectModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </>
  );
}

export default WalletConnectionBanner;
