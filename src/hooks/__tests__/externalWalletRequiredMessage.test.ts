import { describe, it, expect, vi } from "vitest";

let mockNetwork: "testnet" | "public" = "testnet";
vi.mock("@/config/wallet", () => ({
  get STELLAR_NETWORK() {
    return mockNetwork;
  },
}));
vi.mock("@/stores/auth-store", () => ({ useAuthStore: vi.fn() }));
vi.mock("@/hooks/use-wallet-kit", () => ({ useWalletKit: vi.fn() }));
vi.mock("@/hooks/useEscrowSigning", () => ({ useEscrowSigning: vi.fn() }));
vi.mock("@creit.tech/stellar-wallets-kit", () => ({ StellarWalletsKit: {} }));

import {
  CLAIM_WALLET_MESSAGE,
  CONNECT_WALLET_MESSAGE,
  externalWalletRequiredMessage,
} from "../useEscrowSigningAction";

describe("externalWalletRequiredMessage", () => {
  it("tells a custodial user on the testnet sandbox to claim their wallet", () => {
    mockNetwork = "testnet";

    expect(externalWalletRequiredMessage()).toBe(CLAIM_WALLET_MESSAGE);
    expect(CLAIM_WALLET_MESSAGE).toMatch(/Claim it/);
  });

  it("tells a user on mainnet to connect their own wallet, since there is nothing to claim there", () => {
    mockNetwork = "public";

    expect(externalWalletRequiredMessage()).toBe(CONNECT_WALLET_MESSAGE);
    expect(CONNECT_WALLET_MESSAGE).not.toMatch(/claim/i);
    expect(CONNECT_WALLET_MESSAGE).toMatch(/Varial, Lobstr or xBull/);
  });
});
