"use client";

import { useCallback, useEffect, useState } from "react";
import { isWalletCancellation, toWalletErrorMessage } from "@/lib/wallet-error-messages";
import { openAndRevealAll, readSealedRound } from "./operations";
import { useSubRosaClient } from "./use-sub-rosa-client";
import type { LiveRoundView, SealedRoundRecord } from "./live.types";

export type RevealState = "idle" | "revealing" | "done" | "error";

export interface UseLiveRoundResult {
  /** True while the initial load is in flight. */
  loading: boolean;
  /** The persisted mapping for this offer, or null if it has no sealed round. */
  record: SealedRoundRecord | null;
  /** Whether this offer is a sealed-proposal offer at all. */
  hasSealedRound: boolean;
  /** On-chain snapshot; null until a wallet is connected and the read lands. */
  view: LiveRoundView | null;
  /** Load / read error, if any. */
  error: string | null;
  /** Re-read registry + on-chain state. */
  refresh: () => Promise<void>;
  /** Whether the connected viewer has already committed a sealed proposal. */
  hasSubmitted: boolean;

  revealState: RevealState;
  revealError: string | null;
  /** Open reveal (if needed) and reveal every committed submission. */
  reveal: () => Promise<void>;
}

/**
 * Loads a sealed round for an offer: the shared registry mapping (works with
 * or without a wallet) plus the live on-chain snapshot (needs a connected
 * wallet as the read-simulation source). Also drives the client's reveal
 * action.
 */
export function useLiveRound(offerId: string | null): UseLiveRoundResult {
  const { client, address, registry } = useSubRosaClient();

  const [loading, setLoading] = useState<boolean>(Boolean(offerId));
  const [record, setRecord] = useState<SealedRoundRecord | null>(null);
  const [view, setView] = useState<LiveRoundView | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [revealState, setRevealState] = useState<RevealState>("idle");
  const [revealError, setRevealError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    if (!offerId) {
      setRecord(null);
      setView(null);
      return;
    }
    setError(null);
    try {
      const found = await registry.getByOffer(offerId);
      setRecord(found);
      if (found && client) {
        setView(await readSealedRound({ client, record: found }));
      } else {
        setView(null);
      }
    } catch (cause) {
      setError(toWalletErrorMessage(cause, "Could not load the sealed round state."));
    }
  }, [offerId, registry, client]);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      // Defer past the synchronous effect body so the loading toggle isn't a
      // cascading setState (React purity lint) — it's driven by async I/O.
      await Promise.resolve();
      if (cancelled) return;
      setLoading(true);
      try {
        await refresh();
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [refresh]);

  const reveal = useCallback(async () => {
    if (!client || !record) {
      setRevealError("Connect your wallet to reveal proposals.");
      setRevealState("error");
      return;
    }
    setRevealState("revealing");
    setRevealError(null);
    try {
      await openAndRevealAll({ client, record });
      await refresh();
      setRevealState("done");
    } catch (cause) {
      if (isWalletCancellation(cause)) {
        setRevealError("You declined the signature request in your wallet.");
      } else {
        setRevealError(
          toWalletErrorMessage(
            cause,
            "Could not reveal yet. The reveal round may not have published — try again shortly.",
          ),
        );
      }
      setRevealState("error");
    }
  }, [client, record, refresh]);

  const hasSubmitted = Boolean(
    address && view?.bidders.some((b) => b === address),
  );

  return {
    loading,
    record,
    hasSealedRound: record !== null,
    view,
    error,
    refresh,
    hasSubmitted,
    revealState,
    revealError,
    reveal,
  };
}
