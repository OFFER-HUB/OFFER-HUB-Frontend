import { describe, expect, it } from "vitest";
import { isWalletNotReadyCode, usdcReadinessFrom } from "@/lib/wallet-readiness";
import type { StellarAccountBalances } from "@/types/wallet.types";

const balances = (hasTrustline: boolean): StellarAccountBalances => ({
  xlm: { code: "XLM", balance: "5.0000000", hasTrustline: true },
  usdc: { code: "USDC", balance: hasTrustline ? "1.0000000" : "0", hasTrustline },
});

describe("usdcReadinessFrom", () => {
  it("is no_account for an unfunded wallet", () => {
    expect(usdcReadinessFrom(balances(false), true)).toBe("no_account");
  });
  it("is no_trustline for a funded wallet without USDC", () => {
    expect(usdcReadinessFrom(balances(false), false)).toBe("no_trustline");
  });
  it("is ready once the USDC trustline exists", () => {
    expect(usdcReadinessFrom(balances(true), false)).toBe("ready");
  });
  it("is unknown before balances load", () => {
    expect(usdcReadinessFrom(null, false)).toBe("unknown");
  });
});

describe("isWalletNotReadyCode", () => {
  it("matches the API's wallet/trustline-required codes only", () => {
    expect(isWalletNotReadyCode("WALLET_REQUIRED")).toBe(true);
    expect(isWalletNotReadyCode("TRUSTLINE_REQUIRED")).toBe(true);
    expect(isWalletNotReadyCode("STELLAR_NETWORK_ERROR")).toBe(false);
    expect(isWalletNotReadyCode(undefined)).toBe(false);
  });
});
