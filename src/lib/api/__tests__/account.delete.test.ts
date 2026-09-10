import { describe, it, expect } from "vitest";
import { describeDeleteAccountError, type DeleteAccountError } from "../account";

function makeError(code: DeleteAccountError["code"], message = "fallback"): DeleteAccountError {
  return { code, message };
}

describe("describeDeleteAccountError", () => {
  it("describes ACTIVE_ORDERS", () => {
    const msg = describeDeleteAccountError(makeError("ACTIVE_ORDERS"));
    expect(msg).toMatch(/active orders/i);
  });

  it("describes INSUFFICIENT_BALANCE", () => {
    const msg = describeDeleteAccountError(makeError("INSUFFICIENT_BALANCE"));
    expect(msg).toMatch(/remaining balance/i);
  });

  it("describes INVALID_PASSWORD", () => {
    const msg = describeDeleteAccountError(makeError("INVALID_PASSWORD"));
    expect(msg).toMatch(/incorrect password/i);
  });

  it("falls back to err.message for UNKNOWN", () => {
    const msg = describeDeleteAccountError(makeError("UNKNOWN", "custom error message"));
    expect(msg).toBe("custom error message");
  });
});
