"use client";

import { useCallback, useState } from "react";
import type { SealedProposal } from "@sub-rosa/sdk";
import { isWalletCancellation, toWalletErrorMessage } from "@/lib/wallet-error-messages";
import { submitSealedProposal } from "./operations";
import { useSubRosaClient } from "./use-sub-rosa-client";
import type { SealedRoundRecord } from "./live.types";

export type SubmitSealedState =
  | "idle"
  | "sealing" // tlock-encrypt the proposal to the reveal round
  | "committing" // wallet signature + submit_v2 (escrow 0)
  | "done"
  | "error";

export interface UseSubmitSealedProposalResult {
  state: SubmitSealedState;
  error: string | null;
  /** commit_v2 transaction hash, once submitted. */
  txHash: string | null;
  canSubmit: boolean;
  submit: (record: SealedRoundRecord, proposal: SealedProposal) => Promise<boolean>;
  reset: () => void;
}

/**
 * Seals a freelancer's proposal to the round's Drand round and commits it
 * on-chain with zero escrow (ReceiptOnly). The plaintext is encrypted before
 * it ever leaves the browser and is never persisted anywhere in the clear.
 */
export function useSubmitSealedProposal(): UseSubmitSealedProposalResult {
  const { client, address } = useSubRosaClient();
  const [state, setState] = useState<SubmitSealedState>("idle");
  const [error, setError] = useState<string | null>(null);
  const [txHash, setTxHash] = useState<string | null>(null);

  const reset = useCallback(() => {
    setState("idle");
    setError(null);
    setTxHash(null);
  }, []);

  const submit = useCallback(
    async (record: SealedRoundRecord, proposal: SealedProposal): Promise<boolean> => {
      if (!client || !address) {
        setError("Connect your Stellar wallet to submit a sealed proposal.");
        setState("error");
        return false;
      }
      if (Math.floor(Date.now() / 1000) >= record.commitDeadline) {
        setError("This round has closed — sealed proposals are no longer accepted.");
        setState("error");
        return false;
      }

      setError(null);
      setTxHash(null);
      try {
        // sealing then committing are distinct so the modal can say which is
        // happening: the wallet only prompts during the commit.
        setState("sealing");
        // Give React a paint before the (fast, local) seal + the wallet prompt.
        await Promise.resolve();
        setState("committing");
        const hash = await submitSealedProposal({ client, record, proposal, bidder: address });
        setTxHash(hash);
        setState("done");
        return true;
      } catch (cause) {
        if (isWalletCancellation(cause)) {
          setError("You declined the signature request in your wallet.");
        } else {
          setError(toWalletErrorMessage(cause, "Could not submit the sealed proposal. Please try again."));
        }
        setState("error");
        return false;
      }
    },
    [client, address],
  );

  return { state, error, txHash, canSubmit: client !== null, submit, reset };
}
