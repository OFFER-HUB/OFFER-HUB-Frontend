"use client";

import { cn } from "@/lib/cn";
import { PRIMARY_BUTTON } from "@/lib/styles";
import { STELLAR_NETWORK } from "@/config/wallet";
import { Icon, ICON_PATHS } from "@/components/ui/Icon";
import { useUsdcTrustline } from "@/hooks/useUsdcTrustline";
import type { UsdcReadiness } from "@/types/wallet.types";

/** Stellar's own explanation of XLM, account activation and where to get it. */
export const GET_XLM_URL = "https://developers.stellar.org/docs/learn/fundamentals/lumens";

export interface UsdcReadinessPromptProps {
  readiness: UsdcReadiness;
  /** Called once the USDC trustline is confirmed, e.g. to re-read balances. */
  onEnabled: () => void;
  className?: string;
}

const STEP_LABEL: Record<string, string> = {
  building: "Preparing…",
  awaiting_signature: "Confirm in your wallet…",
  submitting: "Submitting to Stellar…",
};

const PANEL = cn(
  "p-4 rounded-2xl bg-background space-y-3",
  "shadow-[var(--shadow-neumorphic-inset-light)] dark:shadow-[var(--shadow-neumorphic-inset-dark)]"
);

/**
 * Gets a connected wallet ready to hold USDC before any money action (#522):
 * explains activation when the account is unfunded, and offers "Enable USDC"
 * (a `changeTrust` signed in the user's wallet) when the trustline is missing.
 * Renders nothing once the wallet is ready or while readiness is unknown.
 */
export function UsdcReadinessPrompt({ readiness, onEnabled, className }: UsdcReadinessPromptProps): React.JSX.Element | null {
  const trustline = useUsdcTrustline(onEnabled);
  const networkName = STELLAR_NETWORK === "public" ? "mainnet" : "testnet";

  if (readiness === "no_account") {
    return (
      <div role="status" className={cn(PANEL, className)}>
        <p className="flex items-start gap-2 text-sm font-semibold text-text-primary">
          <Icon path={ICON_PATHS.infoCircle} size="sm" className="mt-0.5 shrink-0 text-primary" />
          Activate your wallet on Stellar {networkName}
        </p>
        <p className="text-xs text-text-secondary leading-relaxed">
          A new Stellar account needs a small amount of XLM before it exists on the network (about 1.5 XLM, which
          also covers holding USDC). Send XLM to this address from an exchange or another wallet, then refresh.
        </p>
        <a
          href={GET_XLM_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary hover:text-primary-hover"
        >
          <Icon path={ICON_PATHS.externalLink} size="sm" />
          How to get XLM
        </a>
      </div>
    );
  }

  if (readiness !== "no_trustline") return null;

  const busy = trustline.state === "building" || trustline.state === "awaiting_signature" || trustline.state === "submitting";

  if (trustline.state === "confirmed") {
    return (
      <div role="status" className={cn(PANEL, className)}>
        <p className="flex items-start gap-2 text-sm font-semibold text-success">
          <Icon path={ICON_PATHS.checkCircle} size="sm" className="mt-0.5 shrink-0" />
          USDC enabled. Your wallet can now receive USDC.
        </p>
      </div>
    );
  }

  return (
    <div role="status" className={cn(PANEL, className)}>
      <p className="flex items-start gap-2 text-sm font-semibold text-text-primary">
        <Icon path={ICON_PATHS.infoCircle} size="sm" className="mt-0.5 shrink-0 text-primary" />
        Enable USDC to get paid
      </p>
      <p className="text-xs text-text-secondary leading-relaxed">
        Your wallet can&apos;t hold USDC yet. Enabling it adds a USDC trustline to your account: one signature in
        your wallet, and 0.5 XLM stays reserved while it is enabled. No funds move.
      </p>
      {trustline.error !== null ? (
        <p role="alert" className="flex items-start gap-2 text-xs text-error">
          <Icon path={ICON_PATHS.alertCircle} size="sm" className="mt-0.5 shrink-0" />
          <span>{trustline.error.message}</span>
        </p>
      ) : null}
      <button
        type="button"
        onClick={() => void trustline.enable()}
        disabled={busy}
        className={cn(PRIMARY_BUTTON, "justify-center disabled:opacity-60 disabled:cursor-not-allowed")}
      >
        <Icon path={ICON_PATHS.creditCard} size="sm" />
        <span>{busy ? STEP_LABEL[trustline.state] : trustline.error !== null ? "Try again" : "Enable USDC"}</span>
      </button>
    </div>
  );
}
