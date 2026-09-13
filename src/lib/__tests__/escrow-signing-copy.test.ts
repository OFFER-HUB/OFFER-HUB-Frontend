import { describe, it, expect } from "vitest";
import {
  getStepInfo,
  truncateHash,
  errorCopy,
  stateTitle,
  STEP_INFO,
  OPERATION_FALLBACK_INFO,
} from "../escrow-signing-copy";
import type { EscrowSigningError } from "@/hooks/useEscrowSigning";

describe("escrow-signing-copy", () => {
  describe("getStepInfo", () => {
    it("returns copy override when provided", () => {
      const override = {
        position: "Step 1 of 3",
        confirmedMessage: "Custom confirmed",
        actionTitle: "Custom Action",
        actionExplanation: "Custom explanation",
      };
      const info = getStepInfo("release", "approve_milestone", override);
      expect(info).toEqual(override);
    });

    it("returns null when operation is undefined", () => {
      expect(getStepInfo(undefined, undefined)).toBeNull();
    });

    it("resolves specific step info when matching (operation, step)", () => {
      const info = getStepInfo("release", "approve_milestone");
      expect(info).toEqual(STEP_INFO.release!.approve_milestone);
      expect(info?.actionTitle).toBe("Approve Delivery (Milestone Review)");
    });

    it("falls back to operation fallback info when step not found", () => {
      const info = getStepInfo("fund", null);
      expect(info).toEqual(OPERATION_FALLBACK_INFO.fund);
      expect(info?.actionTitle).toBe("Deposit Funds into Escrow");
    });
  });

  describe("truncateHash", () => {
    it("returns short hashes unchanged", () => {
      expect(truncateHash("abc123")).toBe("abc123");
      expect(truncateHash("1234567890123456")).toBe("1234567890123456");
    });

    it("truncates hashes longer than 16 chars with ellipsis", () => {
      const hash = "12345678abcdef9999888877776666555544443333222211110000";
      const result = truncateHash(hash);
      expect(result).toBe("12345678…2211110000".slice(0, 8) + "…" + hash.slice(-8));
      expect(result.length).toBe(17);
    });
  });

  describe("errorCopy", () => {
    it("handles USER_REJECTED", () => {
      const err: EscrowSigningError = { code: "USER_REJECTED", message: "User rejected" };
      const res = errorCopy(err);
      expect(res.title).toBe("Signing cancelled");
      expect(res.message).toBe("You cancelled the signing. Try again?");
    });

    it("handles XDR_EXPIRED", () => {
      const err: EscrowSigningError = { code: "XDR_EXPIRED", message: "Expired" };
      const res = errorCopy(err);
      expect(res.title).toBe("Transaction expired");
      expect(res.actionHint).toContain("4 minutes");
    });

    it("handles WRONG_SIGNER", () => {
      const err: EscrowSigningError = { code: "WRONG_SIGNER", message: "Not your turn" };
      const res = errorCopy(err);
      expect(res.title).toBe("Not your turn yet");
      expect(res.message).toBe("Not your turn");
    });

    it("handles STALE_TRANSACTION", () => {
      const err: EscrowSigningError = { code: "STALE_TRANSACTION", message: "Stale" };
      const res = errorCopy(err);
      expect(res.title).toBe("Transaction outdated");
    });

    it("handles NO_WALLET_CONNECTED", () => {
      const err: EscrowSigningError = { code: "NO_WALLET_CONNECTED", message: "No wallet" };
      const res = errorCopy(err);
      expect(res.title).toBe("No wallet connected");
    });

    it("handles API_ERROR and default", () => {
      const err: EscrowSigningError = { code: "API_ERROR", message: "Server error" };
      const res = errorCopy(err);
      expect(res.title).toBe("Signing failed");
      expect(res.message).toBe("Server error");
    });
  });

  describe("stateTitle", () => {
    it("returns correct titles for all EscrowSigningState states", () => {
      expect(stateTitle("building", null)).toBe("Preparing transaction");
      expect(stateTitle("awaiting_signature", null)).toBe("Check your wallet");
      expect(stateTitle("submitting", null)).toBe("Submitting to Stellar");
      expect(stateTitle("confirmed", null)).toBe("Transaction confirmed");
      expect(stateTitle("idle", null)).toBe("Preparing transaction");

      const err: EscrowSigningError = { code: "USER_REJECTED", message: "Cancelled" };
      expect(stateTitle("error", err)).toBe("Signing cancelled");
      expect(stateTitle("error", null)).toBe("Signing failed");
    });
  });
});
