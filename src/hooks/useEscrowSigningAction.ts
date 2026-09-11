"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { StellarWalletsKit } from "@creit.tech/stellar-wallets-kit";
import { useAuthStore } from "@/stores/auth-store";
import { useWalletKit } from "@/hooks/use-wallet-kit";
import {
  useEscrowSigning,
  type EscrowSigningState,
  type EscrowSigningError,
} from "@/hooks/useEscrowSigning";
import type { EscrowOperation, EscrowStepName } from "@/lib/api/escrow";

/** Thrown by `run()` when the user dismisses the wallet-connect guard without connecting. Not a failure — callers should treat it as "nothing happened" rather than showing an error. */
export class SigningCancelledError extends Error {
  constructor() {
    super("Signing cancelled");
    this.name = "SigningCancelledError";
  }
}

export interface UseEscrowSigningActionParams {
  orderId: string;
  /** Which on-chain step this instance drives — fixed per modal, one hook call each. */
  operation: EscrowOperation;
  /**
   * The current viewer's role on this order. Release/refund/dispute are
   * step-wise and each step names which side must sign it — without this,
   * a click on the wrong side's turn would hand the connected wallet a
   * transaction Stellar is guaranteed to reject (`tx_bad_auth`) instead of
   * a clear "not your turn yet" message.
   */
  callerRole: "buyer" | "seller";
  /**
   * Runs the existing server-side (custodial) path for INVISIBLE-wallet
   * users. Left completely untouched by this hook — it's called as-is,
   * unchanged from before D2.1, so there is no regression for those users.
   */
  legacyAction: () => Promise<void>;
  /** Order re-read and the action modal closed once the on-chain step lands. */
  onConfirmed: () => void;
}

export interface UseEscrowSigningActionResult {
  /**
   * Starts the right path for the current wallet: the legacy call for an
   * INVISIBLE wallet, or client-side signing for an EXTERNAL one. If SWK
   * isn't currently connected, opens the wallet-connect guard first and
   * resumes automatically once it reports back a connected address.
   *
   * Resolves once the on-chain step lands (after `onConfirmed` has already
   * run) and rejects with the same message shown inline, so a caller with
   * its own follow-up step (e.g. opening the admin dispute record after the
   * on-chain dispute step) can `await` it exactly like the legacy call it
   * replaces — including the wallet-connect detour, which resolves only
   * once the resumed sign completes.
   */
  run: () => Promise<void>;
  /**
   * True for building/awaiting_signature/submitting/confirmed/error — render
   * EscrowSigningModal while this holds. Stays true through the two terminal
   * states so the modal's own confirmed/error screens (transaction hash +
   * Done, or the error copy + Retry/Cancel) actually get to show, instead of
   * closing the instant the on-chain step settles.
   */
  isSigningModalOpen: boolean;
  signingState: EscrowSigningState;
  /** Pass straight through to EscrowSigningModal's `error` prop — its own `errorCopy()` renders the friendly title/message per code. */
  signingError: EscrowSigningError | null;
  /** Pass straight through to EscrowSigningModal's `transactionHash` prop, shown on its confirmed screen. */
  transactionHash: string | null;
  /** Pass straight through to EscrowSigningModal's `step` prop — lets it say which of the multiple release/refund/dispute signatures just landed. */
  currentStep: EscrowStepName | null;
  /** Set once on an `error` state; the action modal is expected to show this inline and clear it on retry. */
  inlineError: string | null;
  clearInlineError: () => void;
  isWalletConnectOpen: boolean;
  closeWalletConnect: () => void;
  onWalletConnected: () => void;
  /**
   * Returns signing to `idle`, which is what actually closes
   * EscrowSigningModal (see `isSigningModalOpen`) — wire this into the
   * modal's `onClose` alongside whatever closes the caller's own confirm
   * dialog. `run()` has already resolved/rejected and `onConfirmed` has
   * already fired by the time confirmed/error is reached, so this is purely
   * about dismissing the modal, not re-running any side effect.
   */
  dismissSigningModal: () => void;
}

/**
 * Shared plumbing behind ReleaseFundsModal, OpenDisputeModal, and
 * RefundModal's D2.1 integration — one instance per modal (each fixed to its
 * own operation), so each modal's signing/error state stays independent even
 * though only one action realistically runs at a time.
 */
export function useEscrowSigningAction({
  orderId,
  operation,
  callerRole,
  legacyAction,
  onConfirmed,
}: UseEscrowSigningActionParams): UseEscrowSigningActionResult {
  const user = useAuthStore((state) => state.user);
  const { address: liveWalletAddress } = useWalletKit();
  const signing = useEscrowSigning();

  const [inlineError, setInlineError] = useState<string | null>(null);
  const [isWalletConnectOpen, setIsWalletConnectOpen] = useState(false);

  // Whether the wallet-connect guard should resume this operation once SWK
  // reports back a connected address.
  const hasPendingSign = useRef(false);
  // Settled by the confirmed/error effect below, so `run()` can be awaited
  // to completion by a caller with its own follow-up step.
  const pendingSettlers = useRef<{ resolve: () => void; reject: (error: Error) => void } | null>(
    null
  );

  const isExternalWallet = user?.wallet?.type === "EXTERNAL";

  const clearInlineError = useCallback(() => setInlineError(null), []);

  const startSigning = useCallback((): Promise<void> => {
    setInlineError(null);
    return new Promise<void>((resolve, reject) => {
      pendingSettlers.current = { resolve, reject };
      void signing.sign(orderId, operation, callerRole);
    });
  }, [orderId, operation, callerRole, signing]);

  const run = useCallback((): Promise<void> => {
    if (!isExternalWallet) {
      return legacyAction();
    }

    if (!liveWalletAddress) {
      return new Promise<void>((resolve, reject) => {
        hasPendingSign.current = true;
        pendingSettlers.current = { resolve, reject };
        setIsWalletConnectOpen(true);
      });
    }

    return startSigning();
  }, [isExternalWallet, legacyAction, liveWalletAddress, startSigning]);

  const closeWalletConnect = useCallback(() => {
    hasPendingSign.current = false;
    setIsWalletConnectOpen(false);
    // The caller's `await run()` needs to settle either way. Rejecting with
    // this specific, recognizable error (rather than resolving) lets a
    // caller with a follow-up step after run() — e.g. opening the admin
    // dispute record — tell "user cancelled" apart from "actually signed"
    // instead of running that follow-up after nothing happened.
    pendingSettlers.current?.reject(new SigningCancelledError());
    pendingSettlers.current = null;
  }, []);

  const onWalletConnected = useCallback(() => {
    setIsWalletConnectOpen(false);
    // Connection just succeeded — sign directly, reusing the settlers the
    // guard's own promise already registered, rather than routing back
    // through `run()`, whose `liveWalletAddress` guard check would read a
    // stale (still-null) closure value if SWK's state event hasn't
    // propagated to this render yet.
    if (hasPendingSign.current) {
      hasPendingSign.current = false;
      setInlineError(null);
      void signing.sign(orderId, operation, callerRole);
    }
  }, [orderId, operation, callerRole, signing]);

  useEffect(() => {
    if (signing.state === "confirmed") {
      onConfirmed();
      pendingSettlers.current?.resolve();
      pendingSettlers.current = null;
    } else if (signing.state === "error") {
      const message = signing.error?.message ?? "Something went wrong. Please try again.";
      setInlineError(message);
      pendingSettlers.current?.reject(new Error(message));
      pendingSettlers.current = null;
    }
    // `run()`'s caller (and the success/error banners) settle here, on the
    // transition into confirmed/error, same as before. What changed is that
    // `signing.reset()` no longer fires in this same tick — see
    // `dismissSigningModal` below for why.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [signing.state]);

  // `signing.reset()` used to run inside the effect above, the instant
  // confirmed/error was reached. That made `isSigningModalOpen` (below) go
  // false again in the same tick, which closed EscrowSigningModal before it
  // ever painted its confirmed/error screen — the transaction-hash-and-Done
  // and the Retry/Cancel screens were effectively dead code. Resetting only
  // once the user actually dismisses the modal (Done, Cancel, X, Escape, or a
  // Retry re-arming it via a fresh `sign()` call) is what lets those screens
  // show at all.
  const dismissSigningModal = useCallback(() => {
    signing.reset();
  }, [signing]);

  const isSigningModalOpen =
    signing.state === "building" ||
    signing.state === "awaiting_signature" ||
    signing.state === "submitting" ||
    signing.state === "confirmed" ||
    signing.state === "error";

  return {
    run,
    isSigningModalOpen,
    signingState: signing.state,
    signingError: signing.error,
    transactionHash: signing.transactionHash,
    currentStep: signing.currentStep,
    inlineError,
    clearInlineError,
    isWalletConnectOpen,
    closeWalletConnect,
    onWalletConnected,
    dismissSigningModal,
  };
}

/** Connected wallet's display name, for the "check your wallet" copy — best-effort. */
export function currentWalletName(): string | null {
  try {
    return StellarWalletsKit.selectedModule?.productName ?? null;
  } catch {
    return null;
  }
}
