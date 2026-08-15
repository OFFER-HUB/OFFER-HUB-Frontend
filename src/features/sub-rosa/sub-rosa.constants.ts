/**
 * Configuration and copy for the Sub Rosa demo.
 *
 * Removing the feature means deleting `src/features/sub-rosa` and
 * `src/app/labs` — see the README in this folder.
 */

/**
 * The demo route 404s unless this is explicitly turned on. Off by default so
 * production stays untouched without a code change; flip it on a preview
 * deploy to show the page.
 *
 * Read as a full literal expression rather than through a helper: Next inlines
 * `process.env.NEXT_PUBLIC_*` at build time only when it can see the static
 * member access.
 */
export const IS_SUBROSA_DEMO_ENABLED = process.env.NEXT_PUBLIC_SUBROSA_DEMO === "true";

export const SUBROSA_DEMO_FLAG = "NEXT_PUBLIC_SUBROSA_DEMO";

/** The Sub Rosa template this demo models. `ReceiptOnly` never moves assets. */
export const SUBROSA_TEMPLATE = "ReceiptOnly" as const;

/** Artificial latency so loading states are visible while clicking through. */
export const MOCK_LATENCY_MS = 400;

export const SUBROSA_LINKS = {
  repo: "https://github.com/karagozemin/Sub-Rosa",
  docs: "https://sub-rosa-web.vercel.app/#/docs",
  pilot:
    "https://github.com/karagozemin/Sub-Rosa/blob/main/docs/pilots/OFFER_HUB_PILOT.md",
  limitations:
    "https://github.com/karagozemin/Sub-Rosa/blob/main/docs/LIMITATIONS.md",
} as const;

/**
 * The split of responsibilities, taken from the "Responsibilities" section of
 * the pilot doc. Rendered verbatim by `BoundaryPanel` so the demo can never be
 * mistaken for Sub Rosa taking over marketplace logic.
 */
export const OFFER_HUB_RESPONSIBILITIES = [
  "Marketplace discovery and fixed-price listings",
  "Freelancer identity and profiles",
  "Subscriptions and visibility",
  "Eligibility and business rules",
  "Job lifecycle and provider selection",
  "Payment, fulfillment, and disputes",
] as const;

export const SUB_ROSA_RESPONSIBILITIES = [
  "The sealed proposal round",
  "Proposal confidentiality before the deadline",
  "The drand-gated reveal lifecycle",
  "The canonical round receipt and offline verification",
] as const;

/** The five states the timeline walks through. */
export const ROUND_STEPS = [
  "Job created",
  "Sealed proposals",
  "Deadline reached",
  "Revealed",
  "Provider selected",
] as const;

/**
 * Placeholder shown wherever a live round would carry real on-chain evidence.
 * The pilot doc is explicit that sample proposals are never presented as
 * on-chain evidence, so no contract id, transaction hash, signature or receipt
 * is ever fabricated here.
 */
export const SAMPLE_ONLY = "Sample only";
