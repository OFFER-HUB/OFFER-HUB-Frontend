import { describe, expect, it, vi } from "vitest";

// The hook module imports the wallet kit, whose browser-only deps don't load in jsdom
vi.mock("@creit.tech/stellar-wallets-kit", () => ({ StellarWalletsKit: {} }));
vi.mock("@/hooks/use-wallet-kit", () => ({ useWalletKit: () => ({}) }));
import { toSigningError } from "@/hooks/useEscrowSigning";

describe("toSigningError", () => {
  it.each(["WALLET_REQUIRED", "TRUSTLINE_REQUIRED"])("keeps the API's %s so the modal can guide the user", (code) => {
    expect(toSigningError({ code, message: "msg" })).toEqual({ code, message: "msg" });
  });

  it("maps STELLAR_NETWORK_ERROR to STALE_TRANSACTION", () => {
    expect(toSigningError({ code: "STELLAR_NETWORK_ERROR", message: "stale" }).code).toBe("STALE_TRANSACTION");
  });

  it("falls back to API_ERROR with a default message", () => {
    expect(toSigningError(null)).toEqual({ code: "API_ERROR", message: "The request failed. Please try again." });
  });

  it("keeps the API's missing-balance message for a payout the wallet can't fund", () => {
    const message = "This payout needs 12.00 USDC and your wallet holds 11.364. Add 0.636 USDC to your wallet and try again.";
    expect(toSigningError({ code: "PAYOUT_INSUFFICIENT_BALANCE", message })).toEqual({
      code: "INSUFFICIENT_BALANCE",
      message,
    });
  });

  it("treats a rejected payout transfer as expired, so Retry signs a fresh one", () => {
    expect(toSigningError({ code: "PAYOUT_TRANSFER_REJECTED", message: "stale" }).code).toBe("XDR_EXPIRED");
  });

  it("treats a Stellar tx_too_late rejection as an expired request", () => {
    expect(
      toSigningError({ code: "API_ERROR", message: "Transaction rejected by Stellar: tx_too_late" }).code,
    ).toBe("XDR_EXPIRED");
  });
});
