import { ModuleType } from "@creit.tech/stellar-wallets-kit";
import type { ModuleInterface } from "@creit.tech/stellar-wallets-kit";

/**
 * A fake SWK wallet module used only in Playwright E2E runs (gated behind
 * `NEXT_PUBLIC_E2E`, see WalletKitProvider.tsx — never included in a normal
 * dev or production build).
 *
 * Real wallet extensions (Freighter, Lobstr, xBull) talk to the browser via
 * each extension's own private messaging protocol, which isn't something a
 * test can safely fake without reverse-engineering that protocol. SWK itself
 * is built to be extensible with custom modules implementing the same
 * `ModuleInterface` Freighter/Lobstr/xBull already implement, so this module
 * plugs into that seam instead: every call site in the app
 * (`useEscrowSigning`, `useEscrowSigningAction`, `WalletConnectModal`, ...)
 * keeps calling the real `StellarWalletsKit` static methods completely
 * unchanged — SWK just happens to be holding this module instead of a real
 * one, and delegates to it exactly the same way.
 *
 * Behavior is driven by `window.__E2E_WALLET__`, which a Playwright test sets
 * via `page.addInitScript()` before navigating.
 */

export const E2E_TEST_WALLET_ID = "e2e-test-wallet";

/** A real Stellar keypair's public key, generated once for this fixture. Never funded, never signs anything real — every network call downstream of it is intercepted by Playwright. */
export const E2E_TEST_WALLET_ADDRESS = "GCBILOGFEOXM62ECWICFOO5P7GICWWZSMBLDHQ3UAWM2E6BHBRQK3W3H";

export interface E2EWalletConfig {
  /** Controls `signTransaction`. Defaults to "approve" when unset. */
  signTransactionBehavior?: "approve" | "reject";
  /** Artificial delay before `signTransaction` settles, so a test can assert on the transient "awaiting_signature" state before it resolves. */
  signTransactionDelayMs?: number;
}

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

declare global {
  interface Window {
    __E2E_WALLET__?: E2EWalletConfig;
  }
}

function config(): E2EWalletConfig {
  if (typeof window === "undefined") return {};
  return window.__E2E_WALLET__ ?? {};
}

export class E2ETestWalletModule implements ModuleInterface {
  moduleType = ModuleType.HOT_WALLET;
  productId = E2E_TEST_WALLET_ID;
  productName = "E2E Test Wallet";
  productUrl = "https://example.com/e2e-test-wallet";
  productIcon = "https://example.com/e2e-test-wallet.png";

  async isAvailable(): Promise<boolean> {
    return true;
  }

  async getAddress(): Promise<{ address: string }> {
    return { address: E2E_TEST_WALLET_ADDRESS };
  }

  async signTransaction(
    xdr: string
  ): Promise<{ signedTxXdr: string; signerAddress?: string }> {
    const cfg = config();
    if (cfg.signTransactionDelayMs) await delay(cfg.signTransactionDelayMs);

    if (cfg.signTransactionBehavior === "reject") {
      // Matches isWalletCancellation()'s pattern list in wallet-error-messages.ts.
      throw new Error("User rejected the request");
    }
    // The XDR content doesn't matter — Playwright intercepts the submit call
    // downstream, so this just needs to look like a signed transaction came back.
    return { signedTxXdr: xdr, signerAddress: E2E_TEST_WALLET_ADDRESS };
  }

  async signAuthEntry(
    authEntry: string
  ): Promise<{ signedAuthEntry: string; signerAddress?: string }> {
    return { signedAuthEntry: authEntry, signerAddress: E2E_TEST_WALLET_ADDRESS };
  }

  async signMessage(
    message: string
  ): Promise<{ signedMessage: string; signerAddress?: string }> {
    return { signedMessage: message, signerAddress: E2E_TEST_WALLET_ADDRESS };
  }

  async getNetwork(): Promise<{ network: string; networkPassphrase: string }> {
    return { network: "TESTNET", networkPassphrase: "Test SDF Network ; September 2015" };
  }
}
