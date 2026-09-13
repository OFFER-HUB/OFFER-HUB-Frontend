import type { EscrowSigningState, EscrowSigningError } from "@/hooks/useEscrowSigning";
import type { EscrowOperation, EscrowStepName } from "@/lib/api/escrow";

export interface StepDetail {
  position: string;
  confirmedMessage: string;
  actionTitle: string;
  actionExplanation: string;
}

export interface EscrowSigningCopyOverride {
  position?: string;
  confirmedMessage: string;
  actionTitle: string;
  actionExplanation: string;
}

export interface ErrorCopyDetail {
  title: string;
  message: string;
  actionHint: string;
}

/**
 * Human framing for one on-chain step, keyed by (operation, step).
 */
export const STEP_INFO: Partial<
  Record<EscrowOperation, Partial<Record<EscrowStepName, StepDetail>>>
> = {
  release: {
    approve_milestone: {
      position: "Step 1 of 2 — Approve delivery",
      confirmedMessage:
        "Delivery approved. Click “Release Funds” again to send the payment — that's a second, separate signature.",
      actionTitle: "Approve Delivery (Milestone Review)",
      actionExplanation:
        "You are signing on-chain approval of the delivered work. This verifies milestone satisfaction before releasing payment.",
    },
    release: {
      position: "Step 2 of 2 — Release funds",
      confirmedMessage: "Funds released to the freelancer.",
      actionTitle: "Release Escrow Payment",
      actionExplanation:
        "You are authorizing the smart contract to transfer locked funds directly to the freelancer's wallet address.",
    },
    complete_milestone: {
      position: "Milestone completion",
      confirmedMessage: "Milestone marked as completed on-chain. Awaiting buyer review.",
      actionTitle: "Mark Milestone Completed",
      actionExplanation:
        "You are recording milestone completion on the Stellar smart contract so the buyer can inspect deliverables and release funds.",
    },
  },
  refund: {
    dispute: {
      position: "Step 1 of 1 — Request refund",
      confirmedMessage: "Refund request submitted on-chain.",
      actionTitle: "Request Escrow Refund",
      actionExplanation:
        "You are submitting an on-chain refund request to the escrow smart contract.",
    },
  },
  dispute: {
    dispute: {
      position: "Step 1 of 1 — Open dispute",
      confirmedMessage: "Dispute recorded on-chain.",
      actionTitle: "Open Escrow Dispute",
      actionExplanation:
        "You are recording an escrow dispute on the Stellar ledger. Funds will remain securely held until resolved.",
    },
  },
};

export const OPERATION_FALLBACK_INFO: Record<EscrowOperation, StepDetail> = {
  create: {
    position: "Escrow initialization",
    confirmedMessage: "Escrow contract initialized on-chain. Ready for funding.",
    actionTitle: "Create Escrow Agreement",
    actionExplanation:
      "You are deploying a Soroban escrow contract on Stellar to safeguard payments for this order.",
  },
  fund: {
    position: "Escrow funding",
    confirmedMessage: "Funds are secured in smart escrow.",
    actionTitle: "Deposit Funds into Escrow",
    actionExplanation:
      "You are authorizing the deposit of order funds into the smart contract escrow. Funds are locked until work is approved.",
  },
  release: {
    position: "Escrow release",
    confirmedMessage: "Funds released to the freelancer.",
    actionTitle: "Release Escrow Funds",
    actionExplanation:
      "You are authorizing the release of escrowed payment.",
  },
  refund: {
    position: "Escrow refund",
    confirmedMessage: "Refund request submitted on-chain.",
    actionTitle: "Request Escrow Refund",
    actionExplanation:
      "You are submitting an on-chain refund request.",
  },
  dispute: {
    position: "Escrow dispute",
    confirmedMessage: "Dispute recorded on-chain.",
    actionTitle: "Open Escrow Dispute",
    actionExplanation:
      "You are opening a dispute on the Stellar blockchain.",
  },
};

export function getStepInfo(
  operation: EscrowOperation | undefined,
  step: EscrowStepName | null | undefined,
  copyOverride?: EscrowSigningCopyOverride | null
): StepDetail | null {
  if (copyOverride) {
    return { position: copyOverride.position ?? "", ...copyOverride };
  }
  if (!operation) return null;
  if (step && STEP_INFO[operation]?.[step]) {
    return STEP_INFO[operation]![step]!;
  }
  return OPERATION_FALLBACK_INFO[operation] ?? null;
}

export function truncateHash(hash: string): string {
  if (hash.length <= 16) return hash;
  return `${hash.slice(0, 8)}…${hash.slice(-8)}`;
}

/** Text shown for named error codes with actionable next steps. */
export function errorCopy(error: EscrowSigningError): ErrorCopyDetail {
  switch (error.code) {
    case "USER_REJECTED":
      return {
        title: "Signing cancelled",
        message: "You cancelled the signing. Try again?",
        actionHint:
          "No funds were moved and no smart contract state was altered. Click Retry whenever you are ready to sign again.",
      };
    case "XDR_EXPIRED":
      return {
        title: "Transaction expired",
        message: "Transaction expired. Please try again.",
        actionHint:
          "Soroban transactions expire after 4 minutes for security reasons. Click Retry below to generate a fresh transaction for your wallet.",
      };
    case "WRONG_SIGNER":
      return {
        title: "Not your turn yet",
        message: error.message,
        actionHint:
          "Please wait for the other party to complete their on-chain step before you can proceed with this signature.",
      };
    case "STALE_TRANSACTION":
      return {
        title: "Transaction outdated",
        message: error.message,
        actionHint:
          "This can happen if the same action was started twice — for example, if the page was reopened while a signature was still pending. Click Retry to fetch a fresh transaction and sign it.",
      };
    case "NO_WALLET_CONNECTED":
      return {
        title: "No wallet connected",
        message: error.message || "Your wallet was disconnected.",
        actionHint:
          "Please connect your Stellar wallet extension (such as Freighter) and try again.",
      };
    case "API_ERROR":
    default:
      return {
        title: "Signing failed",
        message: error.message,
        actionHint:
          "Please check your internet connection, ensure your wallet has enough XLM for the network fee (~0.00001 XLM), and try again.",
      };
  }
}

export function stateTitle(state: EscrowSigningState, error: EscrowSigningError | null): string {
  switch (state) {
    case "building":
      return "Preparing transaction";
    case "awaiting_signature":
      return "Check your wallet";
    case "submitting":
      return "Submitting to Stellar";
    case "confirmed":
      return "Transaction confirmed";
    case "error":
      return error ? errorCopy(error).title : "Signing failed";
    case "idle":
      return "Preparing transaction";
  }
}
