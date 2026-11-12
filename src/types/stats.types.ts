/**
 * Public validation results, exactly as served by the API's
 * `GET /validation/runs` (OFFER-HUB-API #318). Do not reshape on this side.
 */
export interface ValidationTxConfirmation {
  hash: string;
  status: "SUCCESS" | "FAILED" | "NOT_FOUND";
  ledger?: number;
  ledgerClosedAt?: string;
  confirmedInMs: number;
  polls: number;
}

export interface ValidationStep {
  name: string;
  status: "passed" | "failed" | "skipped";
  txHashes: string[];
  confirmations: ValidationTxConfirmation[];
  payoutId?: string;
  durationMs: number;
  error?: string;
  details?: Record<string, unknown>;
}

/** Disbursement verified by the validation runner straight against BlindPay's API. Amounts in minor units. */
export interface ValidationReceipt {
  corridor: string;
  source: "blindpay";
  blindpayPayoutId: string;
  status: "completed";
  currency: string;
  receiverAmountMinor: number;
  senderAmountMinor: number;
  stellarTxHash: string | null;
  matchesPayoutTransfer: boolean | null;
  paymentProvider: string | null;
  providerTransactionId: string | null;
  completedAt: string;
  verifiedAt: string;
}

export interface PublicValidationRun {
  id: string;
  startedAt: string;
  finishedAt: string;
  network: "testnet" | "mainnet";
  status: "passed" | "failed";
  corridor: string;
  steps: ValidationStep[];
  stellarExpertUrls: string[];
  blindpayPayoutId: string | null;
  blindpayStatus: string | null;
  trigger: string;
  durationMs: number;
  orderId: string | null;
  contractId: string | null;
  stellarExpertContractUrl: string | null;
  receipt: ValidationReceipt | null;
  publishedAt: string;
}

export interface PublicValidationResults {
  runs: PublicValidationRun[];
  total: number;
}

export interface PlatformStatsSummary {
  users: number;
  wallets: number;
  escrows: number;
  transactions: number;
}

export interface RecentWallet {
  id: string;
  publicKey: string;
  createdAt: string;
}

export interface RecentEscrow {
  id: string;
  orderId: string;
  trustlessContractId: string | null;
  status: string;
  amount: string;
  createdAt: string;
}

export interface PlatformStatsResponse {
  summary: PlatformStatsSummary;
  recentWallets: RecentWallet[];
  recentEscrows: RecentEscrow[];
}
