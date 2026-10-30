export interface PublicValidationRun {
  id: string;
  name: string;
  status: string;
  completedAt: string;
  stellarExpertUrl: string | null;
  blindPayReceiptUrl: string | null;
}

export interface PublicValidationResults {
  publishedAt: string;
  runs: PublicValidationRun[];
}
