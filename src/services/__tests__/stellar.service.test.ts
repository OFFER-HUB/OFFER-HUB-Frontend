import { describe, expect, it, vi } from "vitest";
import { xdr } from "@stellar/stellar-sdk";
import {
  StellarAccountNotFoundError,
  StellarRpcRequestError,
  fetchAccountBalances,
  formatStroops,
  type LedgerEntriesReader,
} from "@/services/stellar.service";

const ACCOUNT = "GCAA763N2ETT5GATWNAC5JMHXAHMJYOZGDZXE3FZYL54NFEHXTSSMACI";

/** Just enough of a ledger entry for the reader: its type and balance. */
function entry(kind: "account" | "trustline", stroops: string) {
  const balance = { balance: () => ({ toString: () => stroops }) };
  return {
    val: {
      switch: () => (kind === "account" ? xdr.LedgerEntryType.account() : xdr.LedgerEntryType.trustline()),
      account: () => balance,
      trustLine: () => balance,
    },
  };
}

function serverReturning(entries: ReturnType<typeof entry>[]): LedgerEntriesReader & { getLedgerEntries: ReturnType<typeof vi.fn> } {
  return { getLedgerEntries: vi.fn().mockResolvedValue({ entries, latestLedger: 1 }) } as never;
}

describe("formatStroops", () => {
  it("renders 7-decimal fixed point", () => {
    expect(formatStroops(BigInt("99749999800"))).toBe("9974.9999800");
    expect(formatStroops(BigInt(0))).toBe("0.0000000");
    expect(formatStroops(BigInt(5))).toBe("0.0000005");
  });
});

describe("fetchAccountBalances", () => {
  it("reads the account and the USDC trustline in one getLedgerEntries call", async () => {
    const server = serverReturning([entry("account", "50000000"), entry("trustline", "1234567891")]);

    const balances = await fetchAccountBalances(ACCOUNT, {}, server);

    expect(server.getLedgerEntries).toHaveBeenCalledTimes(1);
    const keys = server.getLedgerEntries.mock.calls[0] as xdr.LedgerKey[];
    expect(keys.map((k) => k.switch().name)).toEqual(["account", "trustline"]);
    expect(balances).toEqual({
      xlm: { code: "XLM", balance: "5.0000000", hasTrustline: true },
      usdc: { code: "USDC", balance: "123.4567891", hasTrustline: true },
    });
  });

  it("tells a funded account without a USDC trustline apart from a missing account", async () => {
    const server = serverReturning([entry("account", "50000000")]);

    const balances = await fetchAccountBalances(ACCOUNT, {}, server);

    expect(balances.xlm.hasTrustline).toBe(true);
    expect(balances.usdc).toEqual({ code: "USDC", balance: "0", hasTrustline: false });
  });

  it("throws StellarAccountNotFoundError for an unfunded account", async () => {
    const server = serverReturning([]);

    await expect(fetchAccountBalances(ACCOUNT, {}, server)).rejects.toBeInstanceOf(StellarAccountNotFoundError);
  });

  it("throws StellarRpcRequestError when the RPC is unreachable", async () => {
    const server = { getLedgerEntries: vi.fn().mockRejectedValue(new Error("network down")) };

    await expect(fetchAccountBalances(ACCOUNT, {}, server)).rejects.toBeInstanceOf(StellarRpcRequestError);
  });

  it("throws StellarRpcRequestError for an invalid address without calling the RPC", async () => {
    const server = serverReturning([]);

    await expect(fetchAccountBalances("not-an-address", {}, server)).rejects.toBeInstanceOf(StellarRpcRequestError);
    expect(server.getLedgerEntries).not.toHaveBeenCalled();
  });

  it("drops a read whose signal was aborted while in flight", async () => {
    const controller = new AbortController();
    const server = {
      getLedgerEntries: vi.fn().mockImplementation(async () => {
        controller.abort();
        return { entries: [entry("account", "1")], latestLedger: 1 };
      }),
    };

    await expect(fetchAccountBalances(ACCOUNT, { signal: controller.signal }, server)).rejects.toMatchObject({
      name: "AbortError",
    });
  });
});
