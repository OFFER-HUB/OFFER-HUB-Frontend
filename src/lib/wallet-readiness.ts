import type { StellarAccountBalances, UsdcReadiness } from "@/types/wallet.types";

/** Readiness from what `useWalletBalance` returns for the connected wallet. */
export function usdcReadinessFrom(balances: StellarAccountBalances | null, isUnfunded: boolean): UsdcReadiness {
  if (isUnfunded) return "no_account";
  if (balances === null) return "unknown";
  return balances.usdc.hasTrustline ? "ready" : "no_trustline";
}

/** API error codes a money action returns when the wallet is not ready (OFFER-HUB-API #342). */
export const WALLET_NOT_READY_CODES = ["WALLET_REQUIRED", "TRUSTLINE_REQUIRED"] as const;
export type WalletNotReadyCode = (typeof WALLET_NOT_READY_CODES)[number];

export function isWalletNotReadyCode(code: unknown): code is WalletNotReadyCode {
  return typeof code === "string" && (WALLET_NOT_READY_CODES as readonly string[]).includes(code);
}
