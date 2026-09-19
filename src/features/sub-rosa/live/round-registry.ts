/**
 * The shared `offerId → sealed round` mapping.
 *
 * Why this exists: the Round contract can only be queried by numeric round id
 * (get_round_v2), never by our offer id, and there is no on-chain
 * query-by-item_ref. So the client who opens a round must publish the round
 * coordinates somewhere every freelancer can read them back. That's this
 * registry.
 *
 * It stores round *coordinates and evidence only* — never proposal plaintext
 * (see `SealedRoundRecord`). Two backends implement one interface:
 *   - Supabase (PostgREST over fetch): the real, shared store. No
 *     `@supabase/supabase-js` dependency — plain REST with the public anon
 *     key, which is safe to ship in the frontend.
 *   - localStorage: a single-browser dev fallback so the flow runs before
 *     Supabase env is configured. Not shared across users — fine for one
 *     developer poking at both roles in one browser, useless for a real
 *     two-party demo.
 */

import type { SealedRoundRecord } from "./live.types";

export interface RoundRegistry {
  /** The round backing an offer, or null if the offer has no sealed round. */
  getByOffer(offerId: string): Promise<SealedRoundRecord | null>;
  /** Publish the round mapping for an offer. Write-once: an existing mapping is
   *  left untouched (the round is immutable once created). */
  put(record: SealedRoundRecord): Promise<void>;
}

const TABLE = "sub_rosa_rounds";

/** Registry backed by Supabase's PostgREST endpoint. */
class SupabaseRoundRegistry implements RoundRegistry {
  constructor(
    private readonly baseUrl: string,
    private readonly anonKey: string,
  ) {}

  private get endpoint(): string {
    return `${this.baseUrl.replace(/\/$/, "")}/rest/v1/${TABLE}`;
  }

  private get headers(): Record<string, string> {
    return {
      apikey: this.anonKey,
      Authorization: `Bearer ${this.anonKey}`,
      "Content-Type": "application/json",
    };
  }

  async getByOffer(offerId: string): Promise<SealedRoundRecord | null> {
    const url = `${this.endpoint}?offer_id=eq.${encodeURIComponent(offerId)}&limit=1`;
    const res = await fetch(url, { headers: this.headers });
    if (!res.ok) {
      throw new Error(`Sub Rosa registry read failed (${res.status}): ${await res.text()}`);
    }
    const rows = (await res.json()) as SupabaseRow[];
    const row = rows[0];
    return row ? rowToRecord(row) : null;
  }

  async put(record: SealedRoundRecord): Promise<void> {
    // Insert-once. The registry is immutable by design: a row is written once
    // when the round is created and never changes, so the table exposes no
    // UPDATE/DELETE policy. A duplicate offer_id therefore hits the primary-key
    // conflict (409) — which for us just means "already registered", an
    // idempotent success on retry, not an error.
    const res = await fetch(this.endpoint, {
      method: "POST",
      headers: {
        ...this.headers,
        Prefer: "return=minimal",
      },
      body: JSON.stringify(recordToRow(record)),
    });
    if (res.status === 409) return;
    if (!res.ok) {
      throw new Error(`Sub Rosa registry write failed (${res.status}): ${await res.text()}`);
    }
  }
}

/** Single-browser fallback keyed by offer id. Not shared across users. */
class LocalStorageRoundRegistry implements RoundRegistry {
  private key(offerId: string): string {
    return `subrosa:round:${offerId}`;
  }

  async getByOffer(offerId: string): Promise<SealedRoundRecord | null> {
    if (typeof window === "undefined") return null;
    const raw = window.localStorage.getItem(this.key(offerId));
    if (!raw) return null;
    try {
      return JSON.parse(raw) as SealedRoundRecord;
    } catch {
      return null;
    }
  }

  async put(record: SealedRoundRecord): Promise<void> {
    if (typeof window === "undefined") return;
    window.localStorage.setItem(this.key(record.offerId), JSON.stringify(record));
  }
}

/** PostgREST row shape (snake_case columns). */
interface SupabaseRow {
  offer_id: string;
  round_id: string;
  reveal_round: number;
  commit_deadline: number;
  reveal_deadline: number;
  auditor_pubkey_hex: string;
  contract_id: string;
  network: string;
  create_tx_hash: string | null;
  created_at: string;
}

function recordToRow(record: SealedRoundRecord): SupabaseRow {
  return {
    offer_id: record.offerId,
    round_id: record.roundId,
    reveal_round: record.revealRound,
    commit_deadline: record.commitDeadline,
    reveal_deadline: record.revealDeadline,
    auditor_pubkey_hex: record.auditorPubkeyHex,
    contract_id: record.contractId,
    network: record.network,
    create_tx_hash: record.createTxHash,
    created_at: record.createdAt,
  };
}

function rowToRecord(row: SupabaseRow): SealedRoundRecord {
  return {
    offerId: row.offer_id,
    roundId: row.round_id,
    revealRound: row.reveal_round,
    commitDeadline: row.commit_deadline,
    revealDeadline: row.reveal_deadline,
    auditorPubkeyHex: row.auditor_pubkey_hex,
    contractId: row.contract_id,
    network: row.network as SealedRoundRecord["network"],
    createTxHash: row.create_tx_hash,
    createdAt: row.created_at,
  };
}

let cached: RoundRegistry | null = null;

/**
 * The registry the app should use, chosen from env at first call:
 * Supabase when both `NEXT_PUBLIC_SUPABASE_URL` and
 * `NEXT_PUBLIC_SUPABASE_ANON_KEY` are set, otherwise the localStorage
 * fallback (with a one-time console note so a misconfigured demo is obvious).
 */
export function getRoundRegistry(): RoundRegistry {
  if (cached) return cached;

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (url && anonKey) {
    cached = new SupabaseRoundRegistry(url, anonKey);
  } else {
    if (typeof window !== "undefined") {
      console.warn(
        "[sub-rosa] NEXT_PUBLIC_SUPABASE_URL / _ANON_KEY not set — using a " +
          "single-browser localStorage registry. Freelancers on other devices " +
          "won't see rounds you create.",
      );
    }
    cached = new LocalStorageRoundRegistry();
  }
  return cached;
}

/** Test/hook seam: override the resolved registry. */
export function setRoundRegistry(registry: RoundRegistry): void {
  cached = registry;
}
