/**
 * The four things the product actually does with a sealed round, each built
 * on the real SDK — no mocks, no fabricated hashes. Framework-agnostic: hooks
 * call these; they never touch React.
 *
 *   createSealedRound     client opens a round for an offer (writes registry)
 *   submitSealedProposal  freelancer seals + commits a proposal (escrow 0)
 *   openAndRevealAll      client opens reveal + reveals every submission
 *   readSealedRound       anyone reads on-chain state into a render snapshot
 *
 * Trust boundaries this module keeps:
 *   - No Stellar secret key ever appears here; every state change is signed by
 *     the connected wallet through the `SubRosaClient` it's handed.
 *   - Proposal plaintext is only ever *encrypted* before the deadline; it
 *     re-enters the app only by decrypting an on-chain envelope after reveal.
 *   - Sub Rosa never picks the winner. Reveal just makes every proposal
 *     visible at once; the client still selects a provider through OFFER HUB's
 *     own application-status flow.
 */

import {
  type SubRosaClient,
  type SealedProposal,
  createSealedProposalRound,
  decodePayloadEnvelope,
  decodeSealedProposal,
  fetchRoundSignature,
  generateAuditorKeypair,
  openPayload,
  quicknet,
  sealProposal,
  sealedProposalRound,
} from "@sub-rosa/sdk";

import { deriveDrandDeadline } from "./deadline";
import type { RoundRegistry } from "./round-registry";
import type {
  LiveRoundPhase,
  LiveRoundView,
  RevealedProposal,
  SealedRoundRecord,
  SubRosaNetwork,
} from "./live.types";

/** Same cap the contract enforces (MAX_V2_PARTICIPANTS). */
const MAX_PARTICIPANTS = 25;

// ---------------------------------------------------------------------------
// create
// ---------------------------------------------------------------------------

export interface CreateSealedRoundParams {
  client: SubRosaClient;
  registry: RoundRegistry;
  /** OFFER HUB offer this round backs. */
  offerId: string;
  /** When proposals close (the client's chosen date/time). */
  deadline: Date;
  /** Wallet address opening the round (becomes the round operator). */
  operator: string;
  network: SubRosaNetwork;
}

/**
 * Open a sealed-proposal round for an offer and publish the mapping so
 * freelancers can find it. Returns the persisted record.
 */
export async function createSealedRound({
  client,
  registry,
  offerId,
  deadline,
  operator,
  network,
}: CreateSealedRoundParams): Promise<SealedRoundRecord> {
  const { revealRound, commitDeadline, revealDeadline } = await deriveDrandDeadline(deadline);

  // Opaque 32-byte reference binding the round to this offer. The plaintext
  // offer id is never put on-chain — only its hash.
  const itemRef = await sha256(new TextEncoder().encode(`offer-hub:offer:${offerId}`));

  // Reveal here is purely time-based (Drand). We still must supply an auditor
  // key the seal format requires; we generate it ephemerally and discard the
  // secret, so the selective-disclosure channel is simply unused.
  const { publicKey: auditorPubkey } = generateAuditorKeypair();

  const roundParams = {
    itemRef,
    revealRound,
    commitDeadline,
    revealDeadline,
    auditorPubkey,
    maxParticipants: MAX_PARTICIPANTS,
    operator,
  };

  // Fail before opening a wallet signature prompt when the account/network or
  // contract call is invalid. The helper below submits this same partner-round
  // shape after preflight succeeds.
  const preflight = await client.preflightCreatePartnerRoundV2(
    sealedProposalRound(roundParams),
  );
  if (!preflight.ok) throw preflight.error;

  const roundIdBig = await createSealedProposalRound(client, roundParams);

  const record: SealedRoundRecord = {
    offerId,
    roundId: roundIdBig.toString(),
    revealRound,
    commitDeadline,
    revealDeadline,
    auditorPubkeyHex: toHex(auditorPubkey),
    contractId: client.contractId,
    network,
    createTxHash: lastTxHash(client),
    createdAt: new Date().toISOString(),
  };

  await registry.put(record);
  return record;
}

// ---------------------------------------------------------------------------
// submit
// ---------------------------------------------------------------------------

export interface SubmitSealedProposalParams {
  client: SubRosaClient;
  record: SealedRoundRecord;
  proposal: SealedProposal;
  /** Freelancer wallet address committing the proposal. */
  bidder: string;
}

/**
 * Seal a proposal to the round's Drand round + auditor key and commit it
 * on-chain with zero escrow (ReceiptOnly). Returns the commit tx hash.
 */
export async function submitSealedProposal({
  client,
  record,
  proposal,
  bidder,
}: SubmitSealedProposalParams): Promise<string | null> {
  const drand = quicknet();
  const sealed = await sealProposal({
    round: record.revealRound,
    drand,
    proposal,
    // Auditor identity encryption is all-or-nothing in @sub-rosa/tlock. Bind
    // the blob to the same Stellar account that authorizes commit_v2, matching
    // the canonical SDK smoke flow and preventing identity/address drift.
    identity: new TextEncoder().encode(bidder),
    auditorPublicKey: fromHex(record.auditorPubkeyHex),
  });

  const commitParams = {
    roundId: BigInt(record.roundId),
    sealed,
    escrow: BigInt(0), // ReceiptOnly rounds require zero escrow
    bidder,
  };

  // Keep proposal plaintext local and catch round/deadline/account failures
  // before asking the wallet to sign. submitV2 intentionally runs only after
  // the SDK confirms the exact commit call can be simulated successfully.
  const preflight = await client.preflightCommitV2(commitParams);
  if (!preflight.ok) throw preflight.error;

  await client.submitV2(commitParams);

  return lastTxHash(client);
}

// ---------------------------------------------------------------------------
// reveal
// ---------------------------------------------------------------------------

export interface RevealResult {
  /** Bidders whose envelope was newly revealed by this call. */
  revealed: string[];
  /** Whether open_reveal had to be submitted (first reveal for the round). */
  openedReveal: boolean;
}

/**
 * Open the round for revealing (once the Drand signature exists) and reveal
 * every committed submission that isn't revealed yet. Idempotent: safe to
 * re-run — already-open rounds skip open_reveal and already-revealed
 * submissions are skipped.
 */
export async function openAndRevealAll({
  client,
  record,
}: {
  client: SubRosaClient;
  record: SealedRoundRecord;
}): Promise<RevealResult> {
  const roundId = BigInt(record.roundId);
  const drand = quicknet();

  const round = await client.getRoundV2(roundId);
  let openedReveal = false;

  // Status "Open" means reveal hasn't been opened yet. open_reveal needs the
  // published Drand signature for the reveal round; if it isn't out yet the
  // fetch throws, which surfaces as "reveal round hasn't published".
  if (round.status.tag === "Open") {
    const signature = await fetchRoundSignature(drand, record.revealRound);
    await client.openRevealV2(roundId, signature);
    openedReveal = true;
  }

  const bidders = await client.getBiddersV2(roundId);
  const revealed: string[] = [];

  for (const bidder of bidders) {
    const submission = await client.getSubmissionV2(roundId, bidder);
    // Soroban Option::None is decoded as null by the generated bindings.
    // Treat only an actual envelope as revealed; null means reveal is pending.
    if (submission.revealed_envelope != null) continue; // already revealed

    const seal = await client.getSealV2(roundId, bidder);
    if (!seal) continue; // ciphertext TTL expired; nothing to open

    const envelope = await openPayload(new Uint8Array(seal.ciphertext), drand);
    await client.revealV2({ roundId, bidder, envelope });
    revealed.push(bidder);
  }

  return { revealed, openedReveal };
}

// ---------------------------------------------------------------------------
// read
// ---------------------------------------------------------------------------

/**
 * Read on-chain round state into a render-ready snapshot. Read-only: works
 * with a client that has no signer.
 */
export async function readSealedRound({
  client,
  record,
}: {
  client: SubRosaClient;
  record: SealedRoundRecord;
}): Promise<LiveRoundView> {
  const roundId = BigInt(record.roundId);
  const round = await client.getRoundV2(roundId);
  const bidders = await client.getBiddersV2(roundId);

  // A passed commit deadline is not by itself enough to reveal: the exact
  // Drand round must also have published its signature. Keep this read-only
  // check in the snapshot so the UI cannot offer an early reveal action.
  let revealSignaturePublished = false;
  if (
    round.status.tag === "Open" &&
    Math.floor(Date.now() / 1000) >= record.commitDeadline
  ) {
    try {
      await fetchRoundSignature(quicknet(), record.revealRound);
      revealSignaturePublished = true;
    } catch {
      // The round is still sealed (or Drand is temporarily unreachable).
    }
  }

  const revealed: RevealedProposal[] = [];
  for (const bidder of bidders) {
    const submission = await client.getSubmissionV2(roundId, bidder);
    if (submission.revealed_envelope == null) continue;

    try {
      // The contract persists the complete canonical payload envelope, while
      // decodeSealedProposal expects only its application payload bytes.
      const envelope = decodePayloadEnvelope(
        new Uint8Array(submission.revealed_envelope),
      );
      const proposal = decodeSealedProposal(new Uint8Array(envelope.payload));
      revealed.push({
        bidder,
        timelineDays: proposal.timelineDays,
        approach: proposal.approach,
        totalAmount: proposal.totalAmount,
        currency: proposal.currency,
        deliverables: proposal.deliverables,
        isRevealed: true,
      });
    } catch {
      // A revealed envelope that doesn't decode as our schema — skip it rather
      // than break the whole view.
    }
  }

  return {
    record,
    phase: derivePhase(
      round.status.tag,
      record,
      bidders.length,
      revealed.length,
      revealSignaturePublished,
    ),
    bidders,
    statusTag: round.status.tag,
    revealed,
  };
}

function derivePhase(
  statusTag: string,
  record: SealedRoundRecord,
  bidderCount: number,
  revealedCount: number,
  revealSignaturePublished: boolean,
): LiveRoundPhase {
  const nowSecs = Math.floor(Date.now() / 1000);

  if (statusTag === "Cleared" || statusTag === "Settled" || statusTag === "Voided") {
    return "closed";
  }
  if (nowSecs > record.revealDeadline) return "closed";

  if (statusTag === "Revealing") {
    return bidderCount > 0 && revealedCount >= bidderCount ? "revealed" : "revealable";
  }

  // status Open
  if (nowSecs < record.commitDeadline) return "collecting";
  return revealSignaturePublished ? "revealable" : "sealed";
}

// ---------------------------------------------------------------------------
// small helpers (no extra deps — Web Crypto + manual hex)
// ---------------------------------------------------------------------------

/** The most recent state-changing tx this client submitted, if any. */
function lastTxHash(client: SubRosaClient): string | null {
  const hashes = client.submittedTransactionHashes;
  return hashes.length > 0 ? hashes[hashes.length - 1] : null;
}

async function sha256(bytes: Uint8Array): Promise<Uint8Array> {
  const digest = await crypto.subtle.digest("SHA-256", bytes as unknown as BufferSource);
  return new Uint8Array(digest);
}

function toHex(bytes: Uint8Array): string {
  let out = "";
  for (const b of bytes) out += b.toString(16).padStart(2, "0");
  return out;
}

function fromHex(hex: string): Uint8Array {
  const clean = hex.startsWith("0x") ? hex.slice(2) : hex;
  const out = new Uint8Array(clean.length / 2);
  for (let i = 0; i < out.length; i++) {
    out[i] = parseInt(clean.slice(i * 2, i * 2 + 2), 16);
  }
  return out;
}
