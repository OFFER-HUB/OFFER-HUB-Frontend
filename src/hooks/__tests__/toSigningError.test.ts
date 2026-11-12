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
});
