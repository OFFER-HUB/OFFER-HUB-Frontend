"use client";

import { useCallback, useRef, useState } from "react";
import { StellarWalletsKit } from "@creit.tech/stellar-wallets-kit";
import { useAuthStore } from "@/stores/auth-store";
import { useWalletKit } from "@/hooks/use-wallet-kit";
import { isWalletCancellation, toWalletErrorMessage } from "@/lib/wallet-error-messages";
import { prepareUsdbTrustline, submitUsdbTrustline } from "@/lib/api/usdb-funding";
import type { EscrowSigningState, EscrowSigningError } from "@/hooks/useEscrowSigning";

export interface UseUsdbFundingResult {
  state: EscrowSigningState;
  /** Runs prepare -> sign -> submit for the testnet USDB trustline. */
  sign: () => Promise<void>;
  reset: () => void;
  error: EscrowSigningError | null;
}

/**
 * Client-side signing for testnet-only USDB funding — see
 * `lib/api/usdb-funding.ts`. A single-shot flow like escrow create/fund (no
 * quote, no step sequence), so it's simpler than `usePayoutSigning`: nothing
 * to persist between prepare and submit, a fresh trustline XDR is minted
 * fresh every call.
 */
export function useUsdbFunding(): UseUsdbFundingResult {
  const [state, setState] = useState<EscrowSigningState>("idle");
  const [error, setError] = useState<EscrowSigningError | null>(null);

  const token = useAuthStore((s) => s.token);
  const { address, networkPassphrase } = useWalletKit();

  const inFlight = useRef(false);

  const reset = useCallback(() => {
    setState("idle");
    setError(null);
  }, []);

  const sign = useCallback(async (): Promise<void> => {
    if (inFlight.current || !token) return;

    inFlight.current = true;
    setError(null);

    try {
      setState("building");
      const { unsignedXdr } = await prepareUsdbTrustline(token);

      if (!address) {
        setError({ code: "NO_WALLET_CONNECTED", message: "Connect a wallet before signing." });
        setState("error");
        return;
      }

      setState("awaiting_signature");
      let signedTxXdr: string;
      try {
        ({ signedTxXdr } = await StellarWalletsKit.signTransaction(unsignedXdr, {
          networkPassphrase,
          address,
        }));
      } catch (cause) {
        if (isWalletCancellation(cause)) {
          setError({
            code: "USER_REJECTED",
            message: "You declined the signature request in your wallet.",
          });
        } else {
          setError({
            code: "API_ERROR",
            message: toWalletErrorMessage(cause, "Could not sign the transaction. Please try again."),
          });
        }
        setState("error");
        return;
      }

      setState("submitting");
      await submitUsdbTrustline(token, signedTxXdr);

      setState("confirmed");
    } catch (cause) {
      const message =
        cause && typeof cause === "object" && "message" in cause && typeof cause.message === "string"
          ? cause.message
          : "The request failed. Please try again.";
      setError({ code: "API_ERROR", message });
      setState("error");
    } finally {
      inFlight.current = false;
    }
  }, [token, address, networkPassphrase]);

  return { state, sign, reset, error };
}
