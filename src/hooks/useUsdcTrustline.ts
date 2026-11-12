"use client";

import { useCallback, useRef, useState } from "react";
import { StellarWalletsKit } from "@creit.tech/stellar-wallets-kit";
import { useWalletKit } from "@/hooks/use-wallet-kit";
import { isWalletCancellation, toWalletErrorMessage } from "@/lib/wallet-error-messages";
import { buildUsdcTrustlineXdr, submitSignedTransaction } from "@/services/stellar.service";
import type { EscrowSigningError, EscrowSigningState } from "@/hooks/useEscrowSigning";

export interface UseUsdcTrustlineResult {
  state: EscrowSigningState;
  /** Builds the USDC `changeTrust`, has the connected wallet sign it, and submits it. */
  enable: () => Promise<void>;
  reset: () => void;
  error: EscrowSigningError | null;
  transactionHash: string | null;
}

/**
 * "Enable USDC" for a connected wallet on mainnet (#522). Same single-shot
 * shape as `useUsdbFunding`, but the transaction is built and submitted
 * client-side through Stellar RPC: adding a trustline only involves the
 * user's own account, so the API has no part in it.
 *
 * @param onConfirmed called once the trustline is in a closed ledger, e.g. to
 *   re-read balances
 */
export function useUsdcTrustline(onConfirmed?: () => void): UseUsdcTrustlineResult {
  const [state, setState] = useState<EscrowSigningState>("idle");
  const [error, setError] = useState<EscrowSigningError | null>(null);
  const [transactionHash, setTransactionHash] = useState<string | null>(null);
  const { address, networkPassphrase } = useWalletKit();
  const inFlight = useRef(false);

  const reset = useCallback(() => {
    setState("idle");
    setError(null);
  }, []);

  const enable = useCallback(async (): Promise<void> => {
    if (inFlight.current) return;
    if (!address) {
      setError({ code: "NO_WALLET_CONNECTED", message: "Connect a wallet before enabling USDC." });
      setState("error");
      return;
    }

    inFlight.current = true;
    setError(null);

    try {
      setState("building");
      const unsignedXdr = await buildUsdcTrustlineXdr(address);

      setState("awaiting_signature");
      let signedTxXdr: string;
      try {
        ({ signedTxXdr } = await StellarWalletsKit.signTransaction(unsignedXdr, { networkPassphrase, address }));
      } catch (cause) {
        setError(
          isWalletCancellation(cause)
            ? { code: "USER_REJECTED", message: "You declined the signature request in your wallet." }
            : {
                code: "API_ERROR",
                message: toWalletErrorMessage(cause, "Could not sign the transaction. Please try again."),
              }
        );
        setState("error");
        return;
      }

      setState("submitting");
      setTransactionHash(await submitSignedTransaction(signedTxXdr));
      setState("confirmed");
      onConfirmed?.();
    } catch (cause) {
      setError({
        code: "API_ERROR",
        message: cause instanceof Error && cause.message ? cause.message : "Could not enable USDC. Please try again.",
      });
      setState("error");
    } finally {
      inFlight.current = false;
    }
  }, [address, networkPassphrase, onConfirmed]);

  return { state, enable, reset, error, transactionHash };
}
