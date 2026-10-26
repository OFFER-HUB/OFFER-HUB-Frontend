import { useCallback, useRef, useState } from "react";
import { StellarWalletsKit } from "@creit.tech/stellar-wallets-kit";
import { isWalletCancellation, toWalletErrorMessage } from "./wallet-error-messages";
import type {
  EscrowOperation,
  EscrowSigningState,
  EscrowSigningError,
  EscrowSigningErrorCode,
  PrepareEscrowResult,
  PrepareEscrowStepResult,
  UseStellarEscrowSigningConfig,
  UseStellarEscrowSigningResult,
} from "./types";

/**
 * One prepare endpoint per operation — there is no single generic "get me an
 * XDR" call on the API. Release/refund/dispute are step-wise: their prepare
 * call returns the *next* unsigned step, which may be `null` if the sequence
 * already landed on-chain.
 */
function toApiError(cause: unknown): EscrowSigningError {
  const message =
    cause && typeof cause === "object" && "message" in cause && typeof cause.message === "string"
      ? cause.message
      : "The request failed. Please try again.";

  // STELLAR_NETWORK_ERROR names a specific, known cause (the signed XDR went
  // stale — a newer one was already prepared for the same step) rather than
  // an unclassified failure. Carrying the real code through lets the modal
  // show that instead of its generic "check your connection/XLM" copy.
  const code: EscrowSigningErrorCode =
    cause && typeof cause === "object" && "code" in cause && cause.code === "STELLAR_NETWORK_ERROR"
      ? "STALE_TRANSACTION"
      : "API_ERROR";

  return { code, message };
}

/**
 * Orchestrates the full client-side signing flow: fetch the unsigned
 * XDR from the API, sign it with the connected wallet via Stellar Wallets
 * Kit, and submit the signed XDR back.
 *
 * This hook is fully decoupled from OfferHub-specific UI and API client code.
 * The consumer app provides the prepare/submit functions and wallet context.
 */
export function useStellarEscrowSigning(
  config: UseStellarEscrowSigningConfig
): UseStellarEscrowSigningResult {
  const {
    token,
    wallet,
    prepareCreate,
    prepareFund,
    prepareRelease,
    prepareRefund,
    prepareDispute,
    submit,
  } = config;

  const [state, setState] = useState<EscrowSigningState>("idle");
  const [error, setError] = useState<EscrowSigningError | null>(null);
  const [transactionHash, setTransactionHash] = useState<string | null>(null);
  const [currentStep, setCurrentStep] = useState<import("./types").EscrowStepName | null>(null);

  // Guards a double-submit racing itself.
  const inFlight = useRef(false);

  const reset = useCallback(() => {
    setState("idle");
    setError(null);
    setTransactionHash(null);
    setCurrentStep(null);
  }, []);

  const sign = useCallback(
    async (
      orderId: string,
      operation: EscrowOperation,
      callerRole?: "buyer" | "seller"
    ): Promise<void> => {
      if (inFlight.current || !token) return;

      inFlight.current = true;
      setError(null);
      setTransactionHash(null);

      try {
        setState("building");

        // Route to the appropriate prepare function.
        let prepared: PrepareEscrowResult | PrepareEscrowStepResult;
        switch (operation) {
          case "create":
            prepared = await prepareCreate(token, orderId);
            break;
          case "fund":
            prepared = await prepareFund(token, orderId);
            break;
          case "release":
            prepared = await prepareRelease(token, orderId);
            break;
          case "refund":
            prepared = await prepareRefund(token, orderId);
            break;
          case "dispute":
            prepared = await prepareDispute(token, orderId);
            break;
        }

        if ("step" in prepared) {
          setCurrentStep(prepared.step);
        }

        // Step-wise operations (release/refund/dispute) return unsignedXdr:
        // null once every step has already landed on-chain — nothing left
        // to sign, so this is success, not an error.
        if (!prepared.unsignedXdr) {
          setState("confirmed");
          return;
        }

        // `signer` only exists on step-wise results (release/refund/dispute).
        // If it names the other side, don't hand this XDR to the connected
        // wallet at all — Stellar would reject it with an opaque
        // `tx_bad_auth` that looks like a wallet malfunction rather than
        // "wait for the other party".
        if (
          "signer" in prepared &&
          prepared.signer &&
          callerRole &&
          prepared.signer !== callerRole
        ) {
          setError({
            code: "WRONG_SIGNER",
            message:
              prepared.signer === "seller"
                ? "Waiting for the freelancer to complete their step before you can sign."
                : "Waiting for the client to complete their step before you can sign.",
          });
          setState("error");
          return;
        }

        // Checked here, "when the user returns to sign" — i.e. right before
        // handing the XDR to the wallet, not only at fetch time.
        if (prepared.expiresAt !== null && Date.now() > prepared.expiresAt) {
          setError({
            code: "XDR_EXPIRED",
            message: "This signing request expired. Please try again.",
          });
          setState("error");
          return;
        }

        if (!wallet.address) {
          setError({ code: "NO_WALLET_CONNECTED", message: "Connect a wallet before signing." });
          setState("error");
          return;
        }

        setState("awaiting_signature");
        let signedTxXdr: string;
        try {
          ({ signedTxXdr } = await StellarWalletsKit.signTransaction(prepared.unsignedXdr, {
            networkPassphrase: wallet.networkPassphrase,
            address: wallet.address,
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
              message: toWalletErrorMessage(
                cause,
                "Could not sign the transaction. Please try again."
              ),
            });
          }
          setState("error");
          return;
        }

        setState("submitting");
        // Freshly generated per submit call, not memoized — a retried call
        // must never reuse a key from a previous, possibly-failed attempt.
        const idempotencyKey = crypto.randomUUID();
        const result = await submit(token, orderId, signedTxXdr, operation, idempotencyKey);

        setTransactionHash(result.transactionHash);
        setState("confirmed");
      } catch (cause) {
        setError(toApiError(cause));
        setState("error");
      } finally {
        inFlight.current = false;
      }
    },
    [
      token,
      wallet,
      prepareCreate,
      prepareFund,
      prepareRelease,
      prepareRefund,
      prepareDispute,
      submit,
    ]
  );

  return { state, sign, reset, transactionHash, error, currentStep };
}
