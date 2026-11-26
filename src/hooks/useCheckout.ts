"use client";

import { useCallback, useState } from "react";
import { useEscrowSigningAction } from "@/hooks/useEscrowSigningAction";
import type { EscrowSigningError } from "@/hooks/useEscrowSigning";
import type { Order } from "@/types/order.types";

export type CheckoutPhase = "idle" | "step1" | "step2" | "done" | "error";

export interface UseCheckoutResult {
  pay: () => Promise<void>;
  retryFund: () => Promise<void>;
  phase: CheckoutPhase;
  error: EscrowSigningError | null;
  stepIndex: 1 | 2 | null;
}

export function useCheckout(order: Order): UseCheckoutResult {
  const [phase, setPhase] = useState<CheckoutPhase>("idle");
  const [error, setError] = useState<EscrowSigningError | null>(null);
  const [stepIndex, setStepIndex] = useState<1 | 2 | null>(null);

  const createSigning = useEscrowSigningAction({
    orderId: order.id,
    operation: "create",
    callerRole: "buyer",
    onConfirmed: () => {
      void 0;
    },
  });

  const fundSigning = useEscrowSigningAction({
    orderId: order.id,
    operation: "fund",
    callerRole: "buyer",
    onConfirmed: () => {
      void 0;
    },
  });

  const runCreate = useCallback(async (): Promise<void> => {
    setPhase("step1");
    setStepIndex(1);
    setError(null);
    await createSigning.run();
    if (createSigning.signingError) {
      setError(createSigning.signingError);
      setPhase("error");
      throw new Error(createSigning.signingError.message);
    }
  }, [createSigning]);

  const runFund = useCallback(async (): Promise<void> => {
    setPhase("step2");
    setStepIndex(2);
    setError(null);
    await fundSigning.run();
    if (fundSigning.signingError) {
      setError(fundSigning.signingError);
      setPhase("error");
      throw new Error(fundSigning.signingError.message);
    }
  }, [fundSigning]);

  const pay = useCallback(async (): Promise<void> => {
    setError(null);
    try {
      const status = order.status;
      if (status === "ESCROW_FUNDING") {
        await runFund();
      } else if (status === "ESCROW_CREATING") {
        await runCreate();
        await runFund();
      } else {
        // ORDER_CREATED / FUNDS_RESERVED
        await runCreate();
        await runFund();
      }
      setPhase("done");
      setStepIndex(null);
    } catch (cause) {
      const signingError =
        createSigning.signingError ?? fundSigning.signingError ?? null;
      if (signingError) setError(signingError);
      else if (cause instanceof Error) {
        setError({ code: "API_ERROR", message: cause.message });
      }
      if (phase !== "error") setPhase("error");
    }
  }, [order.status, runCreate, runFund, createSigning, fundSigning, phase]);

  const retryFund = useCallback(async (): Promise<void> => {
    setError(null);
    try {
      await runFund();
      setPhase("done");
      setStepIndex(null);
    } catch (cause) {
      const signingError = fundSigning.signingError ?? null;
      if (signingError) setError(signingError);
      else if (cause instanceof Error) setError({ code: "API_ERROR", message: cause.message });
      setPhase("error");
    }
  }, [runFund, fundSigning]);

  // expose signing modals? not needed

  return { pay, retryFund, phase, error, stepIndex };
}
