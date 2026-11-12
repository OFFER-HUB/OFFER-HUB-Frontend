import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

/** Loads src/config/wallet.ts fresh with the given environment. */
async function loadConfig(env: Record<string, string | undefined>) {
  vi.resetModules();
  for (const key of [
    "NEXT_PUBLIC_STELLAR_NETWORK",
    "NEXT_PUBLIC_STELLAR_RPC_URL",
    "NEXT_PUBLIC_STELLAR_USDC_ISSUER",
  ]) {
    vi.stubEnv(key, env[key] as string);
    if (env[key] === undefined) delete process.env[key];
  }
  return import("../wallet");
}

beforeEach(() => vi.unstubAllEnvs());
afterEach(() => vi.unstubAllEnvs());

describe("wallet config on the mainnet build (NEXT_PUBLIC_STELLAR_NETWORK=public)", () => {
  it("points everything at mainnet and nothing at testnet", async () => {
    const config = await loadConfig({ NEXT_PUBLIC_STELLAR_NETWORK: "public" });

    expect(config.STELLAR_NETWORK).toBe("public");
    expect(config.NETWORK_PASSPHRASE).toBe("Public Global Stellar Network ; September 2015");
    expect(config.STELLAR_EXPLORER_URL).toBe("https://stellar.expert/explorer/public");
    expect(config.STELLAR_RPC_URL).toBe("https://mainnet.sorobanrpc.com");
    expect(config.USDC_ISSUER).toBe("GA5ZSEJYB37JRC5AVCIA5MOP4RHTM335X2KGX3IHOJAPP5RE34K4KZVN");

    const everything = [config.NETWORK_PASSPHRASE, config.STELLAR_EXPLORER_URL, config.STELLAR_RPC_URL];
    for (const value of everything) expect(value.toLowerCase()).not.toContain("test");
  });
});

describe("wallet config on the testnet build", () => {
  it("is the default when the variable is unset", async () => {
    const config = await loadConfig({});

    expect(config.STELLAR_NETWORK).toBe("testnet");
    expect(config.NETWORK_PASSPHRASE).toBe("Test SDF Network ; September 2015");
    expect(config.STELLAR_EXPLORER_URL).toBe("https://stellar.expert/explorer/testnet");
    expect(config.STELLAR_RPC_URL).toBe("https://soroban-testnet.stellar.org");
    expect(config.USDC_ISSUER).toBe("GBBD47IF6LWK7P7MDEVSCWR7DPUWV3NY3DTQEVFL4NAT4AQH3ZLLFLA5");
  });

  it.each(["mainnet", "PUBLIC", "", "prod"])(
    "never silently becomes mainnet: %j means testnet",
    async (value) => {
      const config = await loadConfig({ NEXT_PUBLIC_STELLAR_NETWORK: value });

      expect(config.STELLAR_NETWORK).toBe("testnet");
    }
  );
});

describe("overrides", () => {
  it("accepts a self-hosted RPC but ignores a malformed one", async () => {
    const good = await loadConfig({
      NEXT_PUBLIC_STELLAR_NETWORK: "public",
      NEXT_PUBLIC_STELLAR_RPC_URL: "https://rpc.example.com/path/",
    });
    expect(good.STELLAR_RPC_URL).toBe("https://rpc.example.com/path");

    const bad = await loadConfig({
      NEXT_PUBLIC_STELLAR_NETWORK: "public",
      NEXT_PUBLIC_STELLAR_RPC_URL: "javascript:alert(1)",
    });
    expect(bad.STELLAR_RPC_URL).toBe("https://mainnet.sorobanrpc.com");
  });

  it("ignores a USDC issuer override that is not a Stellar public key", async () => {
    const config = await loadConfig({
      NEXT_PUBLIC_STELLAR_NETWORK: "public",
      NEXT_PUBLIC_STELLAR_USDC_ISSUER: "not-a-key",
    });

    expect(config.USDC_ISSUER).toBe("GA5ZSEJYB37JRC5AVCIA5MOP4RHTM335X2KGX3IHOJAPP5RE34K4KZVN");
  });
});
