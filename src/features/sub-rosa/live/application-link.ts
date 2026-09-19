import type { Application } from "@/types/application.types";

const PLACEHOLDER_PREFIX = "🔒 Sealed proposal submitted privately via Sub Rosa.";
const BIDDER_MARKER = /\[sub-rosa-bidder:(G[A-Z2-7]{55})\]/;

export function sealedApplicationPlaceholder(roundId: string, bidder: string): string {
  return (
    `${PLACEHOLDER_PREFIX} ` +
    `Encrypted details reveal after proposals close (round #${roundId}). ` +
    `[sub-rosa-bidder:${bidder}]`
  );
}

export function isSealedApplication(application: Application): boolean {
  return application.coverLetter.startsWith(PLACEHOLDER_PREFIX);
}

export function sealedApplicationBidder(application: Application): string | null {
  return BIDDER_MARKER.exec(application.coverLetter)?.[1] ?? null;
}

export function applicationCoverLetterForDisplay(application: Application): string {
  return application.coverLetter.replace(/\s*\[sub-rosa-bidder:G[A-Z2-7]{55}\]\s*$/, "");
}
