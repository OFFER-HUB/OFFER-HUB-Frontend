import { describe, expect, it, vi } from "vitest";
import {
  type SubRosaClient,
  encodePayloadEnvelope,
  encodeSealedProposal,
} from "@sub-rosa/sdk";
import { readSealedRound } from "./operations";
import type { SealedRoundRecord } from "./live.types";

describe("readSealedRound", () => {
  it("decodes a revealed proposal from its canonical payload envelope", async () => {
    const bidder = "GDK4THAIVPVLSVGFWYYM7NASDDUWCQMNMXCN4KXILLK6ZWELRB4VCGBY";
    const revealedEnvelope = encodePayloadEnvelope({
      nonce: new Uint8Array(32),
      payload: encodeSealedProposal({
        timelineDays: 7,
        approach: "A private proposal that has now been revealed.",
        totalAmount: 250,
        currency: "USD",
      }),
    });
    const client = {
      getRoundV2: vi.fn().mockResolvedValue({ status: { tag: "Revealing" } }),
      getBiddersV2: vi.fn().mockResolvedValue([bidder]),
      getSubmissionV2: vi.fn().mockResolvedValue({ revealed_envelope: revealedEnvelope }),
    } as unknown as SubRosaClient;
    const record: SealedRoundRecord = {
      offerId: "offer-1",
      roundId: "27",
      revealRound: 32_349_634,
      commitDeadline: Math.floor(Date.now() / 1000) - 60,
      revealDeadline: Math.floor(Date.now() / 1000) + 3600,
      auditorPubkeyHex: "00".repeat(32),
      contractId: "C".repeat(56),
      network: "testnet",
      createTxHash: null,
      createdAt: new Date().toISOString(),
    };

    const view = await readSealedRound({ client, record });

    expect(view.phase).toBe("revealed");
    expect(view.revealed).toEqual([
      expect.objectContaining({
        bidder,
        timelineDays: 7,
        totalAmount: 250,
        currency: "USD",
      }),
    ]);
  });
});
