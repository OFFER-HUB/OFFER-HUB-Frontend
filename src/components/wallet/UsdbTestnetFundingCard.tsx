"use client";

import { cn } from "@/lib/cn";
import { NEUMORPHIC_CARD, PRIMARY_BUTTON } from "@/lib/styles";
import { Icon, ICON_PATHS } from "@/components/ui/Icon";
import { useUsdbFunding } from "@/hooks/useUsdbFunding";
import { currentWalletName } from "@/hooks/useEscrowSigningAction";
import { EscrowSigningModal } from "@/components/escrow/EscrowSigningModal";

export interface UsdbTestnetFundingCardProps {
  className?: string;
}

/**
 * Testnet-only utility: BlindPay's development instances settle every
 * quote/payout in USDB, their own test stablecoin, not the USDC a wallet
 * otherwise holds. Custodial wallets get this automatically server-side;
 * an external (SWK) wallet has no server-side key, so it needs to sign for
 * its own USDB trustline here before it can complete a test payout.
 *
 * Only rendered on testnet for an external wallet — see the caller in
 * `app/wallet/page.tsx`.
 */
export function UsdbTestnetFundingCard({ className }: UsdbTestnetFundingCardProps): React.JSX.Element {
  const funding = useUsdbFunding();

  const isModalOpen =
    funding.state === "building" ||
    funding.state === "awaiting_signature" ||
    funding.state === "submitting" ||
    funding.state === "confirmed" ||
    funding.state === "error";

  return (
    <div className={cn(NEUMORPHIC_CARD, className)}>
      <h2 className="text-lg font-semibold text-text-primary mb-1 flex items-center gap-2">
        <Icon path={ICON_PATHS.creditCard} size="md" className="text-primary" />
        Testnet funds
      </h2>
      <p className="text-sm text-text-secondary mb-4">
        BlindPay's test environment settles payouts in its own test currency (USDB), not real USDC.
        Get some to try out a full payout on testnet.
      </p>
      <button
        type="button"
        onClick={() => void funding.sign()}
        className={cn(PRIMARY_BUTTON, "justify-center")}
      >
        <Icon path={ICON_PATHS.creditCard} size="sm" />
        <span>Get Testnet USDB</span>
      </button>

      <EscrowSigningModal
        isOpen={isModalOpen}
        state={funding.state}
        error={funding.error}
        transactionHash={null}
        walletName={currentWalletName()}
        copy={{
          actionTitle: "Enable Testnet USDB",
          actionExplanation:
            "You are authorizing your wallet to hold BlindPay's test currency (USDB), needed to try out a payout on testnet.",
          confirmedMessage: "Your wallet can now hold testnet USDB.",
        }}
        onRetry={() => void funding.sign()}
        onClose={funding.reset}
      />
    </div>
  );
}
