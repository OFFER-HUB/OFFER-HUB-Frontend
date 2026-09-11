"use client";

import { useCallback, useRef, useState } from "react";
import { StellarWalletsKit } from "@creit.tech/stellar-wallets-kit";
import { useAuthStore } from "@/stores/auth-store";
import { useWalletKit } from "@/hooks/use-wallet-kit";
import { isWalletCancellation, toWalletErrorMessage } from "@/lib/wallet-error-messages";
import { preparePayoutTransfer, submitPayoutTransfer, type PreparePayoutTransferResult } from "@/lib/api/payout";
import type { EscrowSigningState, EscrowSigningError } from "@/hooks/useEscrowSigning";

export interface UsePayoutSigningResult {
  state: EscrowSigningState;
  /**
   * Runs prepare -> sign -> submit for the seller's BlindPay transfer on one
   * order. Safe to call again after an `error` state — a fresh quote is
   * requested, so an expired one self-heals the same way escrow signing does.
   */
  sign: (orderId: string) => Promise<void>;
  reset: () => void;
  /**
   * The quote this signature is/was for — the fiat amount, rate and
   * expiry the UI should display. Read this instead of the polled `Payout`
   * row: a later re-prepare can replace the quote with a different rate, and
   * this is the one the seller is actually about to sign.
   */
  prepared: PreparePayoutTransferResult | null;
  error: EscrowSigningError | null;
}

/**
 * Client-side signing for the BlindPay off-ramp transfer — the seller's own
 * wallet sending USDC to BlindPay's deposit address. Deliberately a
 * standalone hook rather than a generalization of `useEscrowSigning`: this
 * flow has no `operation` fan-out, no step sequence, no `WRONG_SIGNER` case,
 * but does carry a `quoteId` to echo on submit and a quoted fiat amount/rate
 * escrow has no equivalent of. Forcing a shared engine over both would
 * deepen exactly the concern-mixing already tracked for `EscrowSigningModal`
 * (see Frontend#440) rather than avoid it.
 */
export function usePayoutSigning(): UsePayoutSigningResult {
  const [state, setState] = useState<EscrowSigningState>("idle");
  const [error, setError] = useState<EscrowSigningError | null>(null);
  const [prepared, setPrepared] = useState<PreparePayoutTransferResult | null>(null);

  const token = useAuthStore((s) => s.token);
  const { address, networkPassphrase } = useWalletKit();

  const inFlight = useRef(false);

  const reset = useCallback(() => {
    setState("idle");
    setError(null);
    setPrepared(null);
  }, []);

  const sign = useCallback(
    async (orderId: string): Promise<void> => {
      if (inFlight.current || !token) return;

      inFlight.current = true;
      setError(null);

      try {
        setState("building");
        const result = await preparePayoutTransfer(token, orderId);
        setPrepared(result);

        if (Date.now() > result.expiresAt) {
          setError({ code: "XDR_EXPIRED", message: "This signing request expired. Please try again." });
          setState("error");
          return;
        }

        if (!address) {
          setError({ code: "NO_WALLET_CONNECTED", message: "Connect a wallet before signing." });
          setState("error");
          return;
        }

        setState("awaiting_signature");
        let signedTxXdr: string;
        try {
          ({ signedTxXdr } = await StellarWalletsKit.signTransaction(result.unsignedXdr, {
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
        const idempotencyKey = crypto.randomUUID();
        await submitPayoutTransfer(token, orderId, result.quoteId, signedTxXdr, idempotencyKey);

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
    },
    [token, address, networkPassphrase]
  );

  return { state, sign, reset, prepared, error };
}
