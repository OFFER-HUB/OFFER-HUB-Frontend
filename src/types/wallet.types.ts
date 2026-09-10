import type { StellarNetworkName } from "@/config/wallet";

// ─── Connected-wallet record (backend source of truth) ───────────────────────

/**
 * A wallet record as returned by POST /wallet/connect and related endpoints.
 * Full shape including provider and lifecycle flags.
 */
export interface ConnectedWallet {
  id: string;
  publicKey: string;
  type: string;
  provider: string;
  isPrimary: boolean;
  isActive: boolean;
  createdAt: string;
}

// ─── Custodial ledger types ───────────────────────────────────────────────────

export interface WalletBalance {
  currency: string;
  available: string;
  reserved: string;
}

export interface WalletMonthlyStats {
  currentMonthEarnings: string;
  currentMonthSpending: string;
  previousMonthEarnings: string;
  previousMonthSpending: string;
}

export interface WalletWithdrawals {
  pendingTotal: string;
  pendingCount: number;
}

export interface WalletChartPoint {
  label: string;
  earnings: number;
  spending: number;
}

export type WalletTransactionType = "credit" | "debit" | "reserve";

export interface WalletTransactionRow {
  id: string;
  type: WalletTransactionType;
  amount: string;
  description: string;
  createdAt: string;
  orderId?: string | null;
  balanceAfter?: string | null;
}

export interface WalletTransactionsData {
  currency: string;
  runningBalanceAvailable: boolean;
  transactions: WalletTransactionRow[];
}

export interface WalletDashboardData {
  balance: WalletBalance;
  monthly: WalletMonthlyStats;
  withdrawals: WalletWithdrawals;
  chart: WalletChartPoint[];
  recentTransactions: WalletTransactionRow[];
}

export interface WalletBalanceSummary {
  availableBalance: string;
  reservedBalance: string;
  currency: string;
}

export interface CreateWithdrawalRequestInput {
  amount: number;
  destination: string;
  saveDestination?: boolean;
}

export interface WithdrawalRequestData {
  id: string;
  status: "pending" | "processing" | "completed" | "failed";
  amount: string;
  fee: string;
  totalDeducted: string;
  currency: string;
  destination: string;
  estimatedArrival: string;
  createdAt: string;
  message?: string;
}

/**
 * Canonical sort option for wallet transactions.
 * Used by both the API filter params and the UI filter component.
 */
export type TransactionSortOption = "date-desc" | "date-asc" | "amount-desc" | "amount-asc";

/**
 * API-level filter params for GET /wallet/transactions.
 * All fields are optional — omit to skip.
 */
export interface WalletTransactionFilters {
  search?: string;
  types?: WalletTransactionType[];
  startDate?: string;
  endDate?: string;
  minAmount?: string;
  maxAmount?: string;
  sortBy?: TransactionSortOption;
}

/**
 * UI filter form state. All fields required for controlled-input binding.
 * Use empty string / empty array as the "unset" sentinel.
 */
export interface TransactionFiltersValue {
  search: string;
  types: WalletTransactionType[];
  startDate: string;
  endDate: string;
  minAmount: string;
  maxAmount: string;
  sortBy: TransactionSortOption;
}

// ─── On-chain balance (Horizon / SWK) ────────────────────────────────────────

/**
 * Live USDC balance read from Horizon for the connected external wallet.
 * Independent of the platform custodial ledger.
 */
export interface OnChainUsdcBalance {
  /** USDC balance as Horizon reports it, e.g. "0" without a trustline. */
  amount: string;
  isLoading: boolean;
}

// ─── Wallet store slice ───────────────────────────────────────────────────────

/**
 * Wallet slice of the auth store.
 *
 * `walletConnected` is redundant with `walletAddress !== null`. Both are kept
 * because consumers read the flag, and the two fields are only ever written
 * together by the actions below — never set them independently or they will
 * drift.
 *
 * Connecting a wallet does not authenticate the user: it is independent of
 * `isAuthenticated`, which still comes from email/password or OAuth until the
 * D1.2 challenge-response flow lands.
 */
export interface WalletConnectionState {
  /** Public key of the connected wallet, or null when none is connected. */
  walletAddress: string | null;
  /** True while a wallet is connected. */
  walletConnected: boolean;
  /** Record a successful wallet connection. */
  connectWallet: (address: string) => void;
  /** Clear the connected wallet. */
  disconnectWallet: () => void;
}

/**
 * One asset line of a Stellar account, normalized from Horizon's `balances[]`.
 *
 * Amounts stay strings: Horizon reports 7-decimal fixed point and `number`
 * cannot round-trip large balances exactly. Convert only for display.
 */
export interface StellarAssetBalance {
  /** Display code, e.g. "XLM" or "USDC". */
  code: string;
  /** Balance as Horizon reports it, e.g. "9974.9999800". "0" without a trustline. */
  balance: string;
  /**
   * False when the account holds no trustline for this asset. Always true for
   * XLM, which every funded account holds natively.
   */
  hasTrustline: boolean;
}

/** XLM and USDC balances of a single Stellar account. */
export interface StellarAccountBalances {
  xlm: StellarAssetBalance;
  usdc: StellarAssetBalance;
}

export interface WalletKitContextValue {
  /** True once SWK has been initialized in the browser. False during SSR and first paint. */
  isReady: boolean;
  /** Public key of the connected wallet, or null when no wallet is connected. */
  address: string | null;
  /** Stellar network the kit is configured against. */
  network: StellarNetworkName;
  /** Network passphrase SWK signs with. */
  networkPassphrase: string;
}
