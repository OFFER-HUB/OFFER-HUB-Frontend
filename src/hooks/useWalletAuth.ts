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
        setStep("requesting-challenge");
        const { challenge } = await requestChallenge(publicKey);

        setStep("signing");
        // Blocks on the wallet's own confirmation UI. `address` pins the request
        // to the key we asked a challenge for, in case the wallet holds several.
        const { signedMessage } = await StellarWalletsKit.signMessage(challenge, {
          address: publicKey,
        });

        setStep("verifying");
        const session = await verifySignature(publicKey, signedMessage, challenge);

        // Same store transition as an email login, plus the wallet slice so the
        // navbar and balance card see the address without re-reading the kit.
        login(session.user, session.token);
        connectWallet(publicKey);

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
