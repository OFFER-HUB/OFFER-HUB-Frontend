"use client";

import { useCallback, useEffect, useState } from "react";
import { mockSubRosaAdapter } from "../adapter/mock-adapter";
import type { SubRosaAdapter } from "../adapter/sub-rosa-adapter";
import type { SealedRound } from "../sub-rosa.types";

/**
 * Drives the sealed round through its lifecycle and owns every piece of state
 * the demo needs. The page and its components stay presentational.
 */

type PendingAction = "deadline" | "reveal" | "select" | null;

interface UseSealedRoundResult {
  round: SealedRound | null;
  isLoading: boolean;
  error: string | null;
  pendingAction: PendingAction;
  revealedCount: number;
  reachDeadline: () => void;
  revealProposals: () => void;
  selectProvider: (proposalId: string) => void;
  reset: () => void;
}

export function useSealedRound(
  adapter: SubRosaAdapter = mockSubRosaAdapter
): UseSealedRoundResult {
  const [round, setRound] = useState<SealedRound | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pendingAction, setPendingAction] = useState<PendingAction>(null);

  const load = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      setRound(await adapter.createRound());
    } catch (createError) {
      setRound(null);
      setError(
        createError instanceof Error ? createError.message : "Could not open the sample round."
      );
    } finally {
      setIsLoading(false);
    }
  }, [adapter]);

  useEffect(() => {
    void load();
  }, [load]);

  /**
   * Every transition shares the same shape: mark the action pending, hand the
   * current round to the adapter, swap in whatever comes back.
   */
  const runAction = useCallback(
    (action: Exclude<PendingAction, null>, transition: (current: SealedRound) => Promise<SealedRound>) => {
      if (!round || pendingAction !== null) return;
      setPendingAction(action);
      setError(null);
      void (async () => {
        try {
          setRound(await transition(round));
        } catch (actionError) {
          setError(
            actionError instanceof Error ? actionError.message : "That step could not be completed."
          );
        } finally {
          setPendingAction(null);
        }
      })();
    },
    [round, pendingAction]
  );

  const reachDeadline = useCallback(() => {
    runAction("deadline", (current) => adapter.reachDeadline(current));
  }, [adapter, runAction]);

  const revealProposals = useCallback(() => {
    runAction("reveal", (current) => adapter.revealProposals(current));
  }, [adapter, runAction]);

  const selectProvider = useCallback(
    (proposalId: string) => {
      runAction("select", (current) => adapter.selectProvider(current, proposalId));
    },
    [adapter, runAction]
  );

  const revealedCount = round?.proposals.filter((proposal) => proposal.isRevealed).length ?? 0;

  return {
    round,
    isLoading,
    error,
    pendingAction,
    revealedCount,
    reachDeadline,
    revealProposals,
    selectProvider,
    reset: () => void load(),
  };
}
