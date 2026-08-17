"use client";

import { useCallback, useRef, useState } from "react";
import { StellarWalletsKit } from "@creit.tech/stellar-wallets-kit";
import { useAuthStore } from "@/stores/auth-store";
import {
  requestChallenge,
  verifySignature,
  WalletAuthError,
  type WalletSession,
} from "@/services/wallet-auth.service";

/**
 * Where the flow currently is. Each value maps to a distinct thing the user is
 * waiting on, so the UI can say "check your wallet" instead of a generic spinner
 * — the signing step is the one that blocks on a browser extension popup and is
 * by far the slowest.
 */
export type WalletAuthStep = "idle" | "requesting-challenge" | "signing" | "verifying";

export interface UseWalletAuthResult {
  /** Run challenge → sign → verify → store. Resolves to the session, or null on failure. */
  signIn: (publicKey: string) => Promise<WalletSession | null>;
  step: WalletAuthStep;
  isAuthenticating: boolean;
  error: string | null;
  /** Clear a previous failure, e.g. when the user reopens the dialog. */
  reset: () => void;
}

/**
 * Message shown for a given failure.
 *
 * The API's own message is used when it is safe and specific; the cases below
 * are the ones where it is either too terse or describes a server-side concept
 * the user has no way to act on.
 */
function toUserMessage(error: unknown): string {
  if (error instanceof WalletAuthError) {
    switch (error.code) {
      case "WALLET_CHALLENGE_EXPIRED":
        return "The sign-in request expired. Please try again.";
      case "WALLET_CHALLENGE_MISMATCH":
      case "INVALID_SIGNATURE_FORMAT":
        return "That signature could not be verified. Please try signing again.";
      case "NETWORK_ERROR":
      case "MALFORMED_RESPONSE":
        return error.message;
      default:
        return error.message;
    }
  }

  // Wallet kits reject with plain objects as often as with Errors, and a user
  // declining the signature prompt lands here.
  if (typeof error === "object" && error !== null && "message" in error) {
    const { message } = error as { message: unknown };
    if (typeof message === "string" && message.length > 0) {
      return message;
    }
  }

  return "Could not sign in with your wallet. Please try again.";
}

/**
 * Wallet sign-in: request a nonce, sign it with the connected wallet, exchange
 * the signature for a JWT, and store the session exactly as an email login does.
 */
export function useWalletAuth(): UseWalletAuthResult {
  const [step, setStep] = useState<WalletAuthStep>("idle");
  const [error, setError] = useState<string | null>(null);

  const login = useAuthStore((state) => state.login);
  const connectWallet = useAuthStore((state) => state.connectWallet);

  // Guards against a double-submit racing itself: two flows would each burn a
  // nonce, and the loser's signature would verify against an already-consumed
  // challenge.
  const inFlight = useRef(false);

  const reset = useCallback(() => {
    setError(null);
    setStep("idle");
  }, []);

  const signIn = useCallback(
    async (publicKey: string): Promise<WalletSession | null> => {
      if (inFlight.current) {
        return null;
      }

      inFlight.current = true;
      setError(null);

      try {
        // Fetch the address directly from the wallet extension right before
        // requesting the challenge — the cached `publicKey` may be stale if
        // the user switched accounts in Freighter since connecting.
        setStep("requesting-challenge");
        const { address: liveAddress } = await StellarWalletsKit.fetchAddress();
        const challengeKey = liveAddress || publicKey;
        const { challenge } = await requestChallenge(challengeKey);

        setStep("signing");
        // Blocks on the wallet's own confirmation UI.
        const { signedMessage, signerAddress } = await StellarWalletsKit.signMessage(challenge, {
          address: challengeKey,
        });

        // The signer address returned by the wallet is authoritative.
        // If it differs from the challenge key (Freighter ignored the address
        // hint or the user switched accounts mid-flow), the challenge record
        // in Redis won't match — surface a clear error instead of a confusing 401.
        const effectiveKey = signerAddress || challengeKey;
        if (effectiveKey !== challengeKey) {
          throw new Error(
            "Your wallet signed with a different account than the one selected. " +
            "Please ensure the correct account is active in your wallet and try again."
          );
        }

        setStep("verifying");
        const session = await verifySignature(effectiveKey, signedMessage, challenge);

        login(session.user, session.token);
        connectWallet(effectiveKey);

        // Wallet-first accounts land with firstName === null. Callers decide
        // the next route with isNewUser(session.user) so WalletSignInButton
        // can stay a dumb success callback.

        setStep("idle");
        return session;
      } catch (cause) {
        setError(toUserMessage(cause));
        setStep("idle");
        return null;
      } finally {
        inFlight.current = false;
      }
    },
    [login, connectWallet]
  );

  return {
    signIn,
    step,
    isAuthenticating: step !== "idle",
    error,
    reset,
  };
}
