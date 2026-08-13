"use client";

import { useState } from "react";
import { StellarWalletsKit } from "@creit.tech/stellar-wallets-kit";
import { cn } from "@/lib/cn";
import { Icon, ICON_PATHS, LoadingSpinner } from "@/components/ui/Icon";
import { NEUMORPHIC_CARD, NEUMORPHIC_INSET, PRIMARY_BUTTON } from "@/lib/styles";
import { WalletAddress } from "@/components/ui/WalletAddress";
import { WalletConnectModal } from "@/components/wallet/WalletConnectModal";
import { useWalletKit } from "@/hooks/use-wallet-kit";
import { useAuthStore } from "@/stores/auth-store";
import { requestChallenge } from "@/services/wallet-auth.service";
import {
  claimWallet,
  ClaimWalletError,
  type BlockingEscrow,
  type ClaimWalletResult,
} from "@/lib/api/wallet-claim";

/** What the user is waiting on, so the button can say so. */
type ClaimStep = "idle" | "requesting-challenge" | "signing" | "claiming";

const STEP_LABEL: Record<Exclude<ClaimStep, "idle">, string> = {
  "requesting-challenge": "Preparing...",
  signing: "Check your wallet to sign",
  claiming: "Transferring authority...",
};

function StepHeading({ n, title }: { n: number; title: string }): React.JSX.Element {
  return (
    <div className="flex items-center gap-2.5 mb-1.5">
      <span
        className={cn(
          "w-6 h-6 rounded-lg shrink-0 flex items-center justify-center",
          "bg-primary/10 text-primary text-xs font-bold"
        )}
      >
        {n}
      </span>
      <h3 className="text-sm font-semibold text-text-primary">{title}</h3>
    </div>
  );
}

/**
 * Blocking escrows, named rather than counted.
 *
 * "You have 2 active escrows" leaves the user hunting; the order ids let them
 * go straight to what has to finish first.
 */
function EscrowBlocker({ escrows }: { escrows: BlockingEscrow[] }): React.JSX.Element {
  return (
    <div role="alert" className="rounded-2xl border border-warning/30 bg-warning/10 p-4">
      <div className="flex items-start gap-2.5">
        <Icon path={ICON_PATHS.alertTriangle} size="md" className="text-warning shrink-0 mt-0.5" />
        <div className="min-w-0">
          <p className="text-sm font-semibold text-text-primary">
            Finish your active escrows first
          </p>
          <p className="mt-1 text-sm text-text-secondary">
            The platform still signs releases and refunds with the custodial key. Moving that
            authority now would leave these funds stuck, so the migration stays closed until they
            settle.
          </p>

          {escrows.length > 0 && (
            <ul className="mt-3 space-y-1.5">
              {escrows.map((escrow) => (
                <li
                  key={escrow.escrowId}
                  className="flex items-center justify-between gap-3 text-xs"
                >
                  <span className="font-mono text-text-secondary truncate">{escrow.orderId}</span>
                  <span className="shrink-0 rounded-md bg-background px-2 py-0.5 font-medium text-text-secondary">
                    {escrow.status}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}

function SuccessState({ result }: { result: ClaimWalletResult }): React.JSX.Element {
  return (
    <div className="rounded-2xl border border-success/30 bg-success/10 p-4">
      <div className="flex items-start gap-2.5">
        <Icon path={ICON_PATHS.check} size="md" className="text-success shrink-0 mt-0.5" />
        <div className="min-w-0">
          <p className="text-sm font-semibold text-text-primary">
            Your wallet is now non-custodial
          </p>
          <p className="mt-1 text-sm text-text-secondary">
            Signing authority belongs to your key. The account and its balances are unchanged —
            nothing moved on-chain except who is allowed to sign.
          </p>

          <div className="mt-3">
            <WalletAddress address={result.newSignerPublicKey} showFull />
          </div>

          {result.transactionHash !== null && (
            <a
              href={`https://stellar.expert/explorer/testnet/tx/${result.transactionHash}`}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-3 inline-flex items-center gap-1.5 text-xs font-medium text-primary hover:text-primary-hover"
            >
              View the transaction
              <Icon path={ICON_PATHS.externalLink} size="sm" />
            </a>
          )}
        </div>
      </div>
    </div>
  );
}

/**
 * "Claim Your Wallet" — hands a server-held wallet over to its owner.
 *
 * The three steps the migration plan promises: explain, connect, sign. The
 * explanation is not decoration — this is irreversible, and the user is being
 * asked to take custody of funds the platform held for them.
 */
export function ClaimWalletCard(): React.JSX.Element {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [step, setStep] = useState<ClaimStep>("idle");
  const [error, setError] = useState<string | null>(null);
  const [blockingEscrows, setBlockingEscrows] = useState<BlockingEscrow[] | null>(null);
  const [result, setResult] = useState<ClaimWalletResult | null>(null);

  const { address } = useWalletKit();
  const token = useAuthStore((state) => state.token);

  const isBusy = step !== "idle";

  async function handleClaim(): Promise<void> {
    if (address === null || token === null) return;

    setError(null);
    setBlockingEscrows(null);

    try {
      setStep("requesting-challenge");
      const { challenge } = await requestChallenge(address);

      setStep("signing");
      const { signedMessage } = await StellarWalletsKit.signMessage(challenge, {
        address,
      });

      setStep("claiming");
      const claimed = await claimWallet(token, {
        newSignerPublicKey: address,
        signature: signedMessage,
        challenge,
      });

      setResult(claimed);
    } catch (cause) {
      if (cause instanceof ClaimWalletError) {
        if (cause.code === "WALLET_CLAIM_BLOCKED_BY_ESCROW") {
          setBlockingEscrows(cause.activeEscrows);
        } else {
          setError(cause.message);
        }
      } else if (typeof cause === "object" && cause !== null && "message" in cause) {
        // Wallet kits reject with plain objects; a declined signature lands here.
        const { message } = cause as { message: unknown };
        setError(typeof message === "string" ? message : "The signature was not completed.");
      } else {
        setError("Could not complete the migration. Please try again.");
      }
    } finally {
      setStep("idle");
    }
  }

  return (
    <div className={NEUMORPHIC_CARD}>
      <h2 className="text-lg font-semibold text-text-primary mb-1 flex items-center gap-2">
        <Icon path={ICON_PATHS.shield} size="md" className="text-primary" />
        Claim Your Wallet
      </h2>
      <p className="text-sm text-text-secondary mb-5">
        Take full control of the wallet OfferHub currently holds for you.
      </p>

      {result !== null ? (
        <SuccessState result={result} />
      ) : (
        <div className="space-y-4">
          {/* Step 1 — what this actually does */}
          <div className={cn(NEUMORPHIC_INSET, "rounded-2xl p-4")}>
            <StepHeading n={1} title="What this does" />
            <p className="text-sm text-text-secondary leading-relaxed">
              Right now OfferHub holds the key to your wallet. This transfers signing authority to a
              wallet you control, so only you can move the funds.
            </p>
            <ul className="mt-3 space-y-1.5 text-sm text-text-secondary">
              <li className="flex gap-2">
                <Icon path={ICON_PATHS.check} size="sm" className="text-success shrink-0 mt-0.5" />
                Your balances and account stay exactly as they are — no funds move.
              </li>
              <li className="flex gap-2">
                <Icon path={ICON_PATHS.check} size="sm" className="text-success shrink-0 mt-0.5" />
                OfferHub can no longer sign on your behalf afterwards.
              </li>
              <li className="flex gap-2">
                <Icon
                  path={ICON_PATHS.alertTriangle}
                  size="sm"
                  className="text-warning shrink-0 mt-0.5"
                />
                This cannot be undone. Keep your wallet&apos;s recovery phrase safe.
              </li>
            </ul>
          </div>

          {/* Step 2 — connect */}
          <div className={cn(NEUMORPHIC_INSET, "rounded-2xl p-4")}>
            <StepHeading n={2} title="Connect the wallet you want to own it" />
            {address === null ? (
              <>
                <p className="text-sm text-text-secondary mb-3">
                  Choose the Stellar wallet that will hold the signing key from now on.
                </p>
                <button
                  type="button"
                  onClick={() => setIsModalOpen(true)}
                  className={cn(PRIMARY_BUTTON, "w-full sm:w-auto")}
                >
                  Connect wallet
                </button>
              </>
            ) : (
              <>
                <p className="text-sm text-text-secondary mb-3">
                  Authority will be transferred to this key:
                </p>
                <WalletAddress address={address} showFull />
              </>
            )}
          </div>

          {/* Step 3 — sign */}
          <div className={cn(NEUMORPHIC_INSET, "rounded-2xl p-4")}>
            <StepHeading n={3} title="Sign to confirm" />
            <p className="text-sm text-text-secondary mb-3">
              Approve a one-time signature proving the wallet is yours. OfferHub then submits the
              transfer to Stellar.
            </p>
            <button
              type="button"
              onClick={handleClaim}
              disabled={address === null || token === null || isBusy}
              aria-busy={isBusy}
              className={cn(PRIMARY_BUTTON, "w-full flex items-center justify-center gap-2")}
            >
              {isBusy && <LoadingSpinner size="sm" />}
              {step === "idle" ? "Sign and transfer authority" : STEP_LABEL[step]}
            </button>
          </div>

          {blockingEscrows !== null && <EscrowBlocker escrows={blockingEscrows} />}

          {error !== null && (
            <p role="alert" className="text-sm text-error px-1">
              {error}
            </p>
          )}
        </div>
      )}

      <WalletConnectModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </div>
  );
}
