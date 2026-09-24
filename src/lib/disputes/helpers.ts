const DISPUTE_ELIGIBLE_STATUSES = ["active", "in_progress", "completed"];

export function isOfferEligibleForDispute(_offerId: string, offerStatus: string): boolean {
  return DISPUTE_ELIGIBLE_STATUSES.includes(offerStatus);
}
