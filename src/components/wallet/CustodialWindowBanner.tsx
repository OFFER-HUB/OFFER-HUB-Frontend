"use client";

import Link from "next/link";
import { useCustodialWindow } from "@/hooks/useCustodialWindow";
import { describeCustodialWindow } from "@/lib/custodial-window";

/**
 * Shown on the testnet sandbox to a user whose custodial wallet is still
 * unclaimed, after OfferHub moved to mainnet. Their funds are safe but
 * read-only until they claim the wallet, and the window has an end date.
 */
export function CustodialWindowBanner(): React.JSX.Element | null {
  const window = useCustodialWindow();
  if (window === null) return null;

  const notice = describeCustodialWindow(window);

  return (
    <div
      role="alert"
      className="mb-4 rounded-2xl border border-warning/30 bg-warning/10 p-4 text-sm text-text-primary"
    >
      {notice.state === "open" ? (
        <>
          <p className="font-semibold">
            OfferHub moved to Stellar mainnet on {notice.cutoverOn}. This is the testnet sandbox.
          </p>
          <p className="mt-1 text-text-secondary">
            Your wallet is read-only here until you claim it. You have until{" "}
            <span className="font-semibold text-text-primary">{notice.expiresOn}</span> (
            {notice.daysLeft} {notice.daysLeft === 1 ? "day" : "days"} left) to claim it and recover
            your funds. After that date the remaining custodial keys are destroyed.
          </p>
        </>
      ) : (
        <>
          <p className="font-semibold">The claim window closed on {notice.expiresOn}.</p>
          <p className="mt-1 text-text-secondary">
            The remaining custodial keys were destroyed, so this wallet can no longer be claimed.
          </p>
        </>
      )}
      {notice.state === "open" && (
        <Link
          href="/app/settings"
          className="mt-3 inline-flex rounded-xl bg-primary px-4 py-2 text-xs font-bold text-white hover:bg-primary-hover"
        >
          Claim your wallet
        </Link>
      )}
    </div>
  );
}
