import { afterEach, describe, expect, it, vi } from "vitest";

/** STELLAR_NETWORK is read once at import, so each case loads a fresh module. */
async function loadExplorer(network: string | undefined) {
  vi.resetModules();
  vi.stubEnv("NEXT_PUBLIC_STELLAR_NETWORK", network ?? "");
  return import("@/lib/explorer");
}

describe("explorerUrl", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("links to the public explorer on a mainnet build", async () => {
    const { explorerUrl } = await loadExplorer("public");

    expect(explorerUrl("tx", "abc123")).toBe("https://stellar.expert/explorer/public/tx/abc123");
    expect(explorerUrl("account", "GABC")).toBe("https://stellar.expert/explorer/public/account/GABC");
    expect(explorerUrl("contract", "CABC")).toBe("https://stellar.expert/explorer/public/contract/CABC");
  });

  it("links to the testnet explorer by default", async () => {
    const { explorerUrl } = await loadExplorer(undefined);

    expect(explorerUrl("tx", "abc123")).toBe("https://stellar.expert/explorer/testnet/tx/abc123");
  });

  it("uses an explicit network over the build's one", async () => {
    const { explorerUrl } = await loadExplorer("testnet");

    expect(explorerUrl("tx", "abc123", "public")).toBe("https://stellar.expert/explorer/public/tx/abc123");
  });
});
