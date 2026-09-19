import { describe, expect, it } from "vitest";
import {
  applicationCoverLetterForDisplay,
  isSealedApplication,
  sealedApplicationBidder,
  sealedApplicationPlaceholder,
} from "./application-link";
import type { Application } from "@/types/application.types";

const BIDDER = "GDK4THAIVPVLSVGFWYYM7NASDDUWCQMNMXCN4KXILLK6ZWELRB4VCGBY";

function application(coverLetter: string): Application {
  return {
    id: "application-1",
    offerId: "offer-1",
    freelancerId: "freelancer-1",
    coverLetter,
    status: "PENDING",
    createdAt: "2026-09-20T00:00:00.000Z",
    updatedAt: "2026-09-20T00:00:00.000Z",
  };
}

describe("sealed application links", () => {
  it("round-trips the bidder marker without displaying it", () => {
    const value = application(sealedApplicationPlaceholder("27", BIDDER));

    expect(isSealedApplication(value)).toBe(true);
    expect(sealedApplicationBidder(value)).toBe(BIDDER);
    expect(applicationCoverLetterForDisplay(value)).not.toContain("sub-rosa-bidder");
  });

  it("keeps legacy sealed placeholders detectable", () => {
    const value = application(
      "🔒 Sealed proposal submitted privately via Sub Rosa. Encrypted details reveal after proposals close (round #27).",
    );

    expect(isSealedApplication(value)).toBe(true);
    expect(sealedApplicationBidder(value)).toBeNull();
  });
});
