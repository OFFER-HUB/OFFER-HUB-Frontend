import { describe, expect, it, vi } from "vitest";
import { Account, Keypair, TransactionBuilder, rpc } from "@stellar/stellar-sdk";
import {
  StellarAccountNotFoundError,
  StellarTransactionError,
  buildUsdcTrustlineXdr,
  submitSignedTransaction,
  type TransactionRpc,
} from "@/services/stellar.service";
import { NETWORK_PASSPHRASE, USDC_ISSUER } from "@/config/wallet";

const ACCOUNT = "GCAA763N2ETT5GATWNAC5JMHXAHMJYOZGDZXE3FZYL54NFEHXTSSMACI";

function fakeRpc(overrides: Partial<Record<keyof TransactionRpc, unknown>> = {}) {
  return {
    getAccount: vi.fn().mockResolvedValue(new Account(ACCOUNT, "100")),
    sendTransaction: vi.fn().mockResolvedValue({ status: "PENDING", hash: "h1" }),
    getTransaction: vi.fn().mockResolvedValue({ status: rpc.Api.GetTransactionStatus.SUCCESS }),
    ...overrides,
  } as unknown as TransactionRpc & Record<keyof TransactionRpc, ReturnType<typeof vi.fn>>;
}

async function signedXdr(): Promise<string> {
  const kp = Keypair.random();
  const xdr = await buildUsdcTrustlineXdr(kp.publicKey(), fakeRpc({ getAccount: vi.fn().mockResolvedValue(new Account(kp.publicKey(), "1")) }));
  const tx = TransactionBuilder.fromXDR(xdr, NETWORK_PASSPHRASE);
  tx.sign(kp);
  return tx.toXDR();
}

const noSleep = () => Promise.resolve();

describe("buildUsdcTrustlineXdr", () => {
  it("builds a single changeTrust for the configured USDC asset on the account's next sequence", async () => {
    const xdr = await buildUsdcTrustlineXdr(ACCOUNT, fakeRpc());
    const tx = TransactionBuilder.fromXDR(xdr, NETWORK_PASSPHRASE);

    expect("operations" in tx && tx.operations).toHaveLength(1);
    const op = (tx as unknown as { operations: Array<{ type: string; line: { code: string; issuer: string } }> }).operations[0];
    expect(op.type).toBe("changeTrust");
    expect(op.line.code).toBe("USDC");
    expect(op.line.issuer).toBe(USDC_ISSUER);
    expect((tx as unknown as { sequence: string }).sequence).toBe("101");
  });

  it("throws StellarAccountNotFoundError for an unfunded account", async () => {
    const server = fakeRpc({ getAccount: vi.fn().mockRejectedValue(new Error(`Account not found: ${ACCOUNT}`)) });

    await expect(buildUsdcTrustlineXdr(ACCOUNT, server)).rejects.toBeInstanceOf(StellarAccountNotFoundError);
  });
});

describe("submitSignedTransaction", () => {
  it("returns the hash once the transaction is in a closed ledger", async () => {
    const server = fakeRpc({
      getTransaction: vi
        .fn()
        .mockResolvedValueOnce({ status: rpc.Api.GetTransactionStatus.NOT_FOUND })
        .mockResolvedValueOnce({ status: rpc.Api.GetTransactionStatus.SUCCESS }),
    });

    await expect(submitSignedTransaction(await signedXdr(), server, noSleep)).resolves.toBe("h1");
    expect(server.getTransaction).toHaveBeenCalledTimes(2);
  });

  it("throws when the network rejects it on submission", async () => {
    const server = fakeRpc({ sendTransaction: vi.fn().mockResolvedValue({ status: "ERROR", hash: "h1" }) });

    await expect(submitSignedTransaction(await signedXdr(), server, noSleep)).rejects.toBeInstanceOf(StellarTransactionError);
  });

  it("throws when it fails in the ledger", async () => {
    const server = fakeRpc({ getTransaction: vi.fn().mockResolvedValue({ status: rpc.Api.GetTransactionStatus.FAILED }) });

    await expect(submitSignedTransaction(await signedXdr(), server, noSleep)).rejects.toThrow(/failed on the network/);
  });

  it("gives up when it never lands", async () => {
    const server = fakeRpc({ getTransaction: vi.fn().mockResolvedValue({ status: rpc.Api.GetTransactionStatus.NOT_FOUND }) });

    await expect(submitSignedTransaction(await signedXdr(), server, noSleep)).rejects.toThrow(/not confirmed in time/);
  });
});
