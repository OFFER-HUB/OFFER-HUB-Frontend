"use client";

import { useCallback, useState } from "react";
import { isWalletCancellation, toWalletErrorMessage } from "@/lib/wallet-error-messages";
import { createSealedRound } from "./operations";
import { DeadlineError } from "./deadline";
import { useSubRosaClient } from "./use-sub-rosa-client";
import type { SealedRoundRecord } from "./live.types";

export type CreateSealedRoundState =
  | "idle"
  | "creating" // deriving Drand coordinates → wallet signature → publishing mapping
  | "done"
  | "error";

export interface UseCreateSealedRoundResult {
  state: CreateSealedRoundState;
  error: string | null;
  record: SealedRoundRecord | null;
  /** True once a wallet is connected and a round can be opened. */
  canCreate: boolean;
  /**
   * Open a sealed round for an offer whose proposals close at `deadline`.
   * Returns the persisted record, or null on failure (see `error`).
   */
  create: (offerId: string, deadline: Date) => Promise<SealedRoundRecord | null>;
  reset: () => void;
}

/**
 * Opens a sealed-proposal round for a freshly created offer. Bundles the whole
 * sequence (derive Drand round → sign create_round_v2 → publish the offer→round
 * mapping) behind one `create` call so the create-offer page stays an
 * orchestrator.
 */
export function useCreateSealedRound(): UseCreateSealedRoundResult {
  const { client, address, network, registry } = useSubRosaClient();
  const [state, setState] = useState<CreateSealedRoundState>("idle");
  const [error, setError] = useState<string | null>(null);
  const [record, setRecord] = useState<SealedRoundRecord | null>(null);

  const reset = useCallback(() => {
    setState("idle");
    setError(null);
    setRecord(null);
  }, []);

  const create = useCallback(
    async (offerId: string, deadline: Date): Promise<SealedRoundRecord | null> => {
      if (!client || !address) {
        setError("Connect your Stellar wallet to open a sealed round.");
        setState("error");
        return null;
      }

      setState("creating");
      setError(null);
      try {
        const created = await createSealedRound({
          client,
          registry,
          offerId,
          deadline,
          operator: address,
          network,
        });
        setRecord(created);
        setState("done");
        return created;
      } catch (cause) {
        if (cause instanceof DeadlineError) {
          setError(cause.message);
        } else if (isWalletCancellation(cause)) {
          setError("You declined the signature request in your wallet.");
        } else {
          const message = toWalletErrorMessage(
            cause,
            "Could not open the sealed round. Please try again.",
          );
          setError(
            /insufficient balance/i.test(message)
              ? `Your connected Stellar ${network} account needs XLM for network fees. Fund this same wallet on ${network}, then submit again.`
              : message,
          );
        }
        setState("error");
        return null;
      }
    },
    [client, address, network, registry],
  );

  return { state, error, record, canCreate: client !== null, create, reset };
}
