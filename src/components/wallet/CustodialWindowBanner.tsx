"use client";

import Link from "next/link";
import { Icon, ICON_PATHS } from "@/components/ui/Icon";
import { useCustodialWindow } from "@/hooks/useCustodialWindow";
import { describeCustodialWindow } from "@/lib/custodial-window";

/**
 * Shown on the testnet sandbox to a user whose custodial wallet is still
 * unclaimed, after OfferHub moved to mainnet. Their funds are safe but
 * read-only until they claim the wallet, and the window has an end date.
 *
 * Same shape as the other app banners (EmailVerificationBanner,
 * WalletConnectionBanner): a raised card, an icon tile, a title, one line of
 * detail and the action on the right.
 */
export function CustodialWindowBanner(): React.JSX.Element | null {
  const window = useCustodialWindow();
  if (window === null) return null;

  const notice = describeCustodialWindow(window);
  const isOpen = notice.state === "open";

  return (
    <div
      role="alert"
      data-testid="custodial-window-banner"
      className="flex flex-col gap-3 rounded-2xl bg-white p-4 shadow-[var(--shadow-neumorphic-light)] sm:flex-row sm:items-center sm:justify-between"
    >
      <div className="flex items-start gap-3 sm:items-center">
        <span
          aria-hidden="true"
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-warning/10 text-warning"
        >
          <Icon path={ICON_PATHS.alertTriangle} size="sm" />
        </span>
        <div className="min-w-0">
          {isOpen ? (
            <>
              <p className="font-semibold text-text-primary">Claim your wallet by {notice.expiresOn}</p>
              <p className="text-sm text-text-secondary">
                OfferHub moved to Stellar mainnet on {notice.cutoverOn}. On this testnet sandbox your wallet is
                read-only until you claim it, and the remaining custodial keys are destroyed after that date (
                {notice.daysLeft} {notice.daysLeft === 1 ? "day" : "days"} left).
              </p>
            </>
          ) : (
            <>
              <p className="font-semibold text-text-primary">The claim window closed on {notice.expiresOn}</p>
              <p className="text-sm text-text-secondary">
                The remaining custodial keys were destroyed, so this wallet can no longer be claimed.
              </p>
            </>
          )}
        </div>
      </div>

      {isOpen && (
        <Link
          href="/app/settings"
          className="inline-flex shrink-0 items-center justify-center rounded-xl bg-primary px-3 py-2 text-sm font-semibold text-white shadow-sm transition-opacity hover:bg-primary-hover focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/70"
        >
          Claim your wallet
        </Link>
      )}
    </div>
  );
}
