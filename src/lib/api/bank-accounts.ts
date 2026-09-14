import { API_URL } from "@/config/api";

/** A freelancer's registered payout destination. Mirrors the `BankAccount` Prisma model. */
export interface BankAccount {
  id: string;
  userId: string;
  /** ISO 3166-1 alpha-2, e.g. "MX". */
  country: string;
  /** BlindPay rail, e.g. "SPEI_BITSO". See {@link SUPPORTED_CORRIDORS}. */
  rail: string;
  accountNumber: string;
  bankName: string;
  holderName: string;
  /** Set by BlindPay once the account is registered on their side; null until then. */
  blindpayBankAccountId: string | null;
  isDefault: boolean;
  /** Rail-specific fields BlindPay requires (e.g. `pix_key`, `spei_protocol`). */
  details: Record<string, unknown> | null;
  createdAt: string;
  updatedAt: string;
}

export interface AddBankAccountData {
  country: string;
  rail: string;
  accountNumber: string;
  bankName: string;
  holderName: string;
  isDefault?: boolean;
  /** Required keys depend on `rail` — see {@link SUPPORTED_CORRIDORS_REQUIRED_DETAILS}. */
  details?: Record<string, unknown>;
}

export interface SupportedCorridor {
  /** ISO 3166-1 alpha-2. */
  country: string;
  /** ISO 4217 settlement currency for this corridor. */
  code: string;
  rail: string;
  label: string;
}

/**
 * LATAM corridors OfferHub actually pays out to through BlindPay today.
 *
 * The deliverable this ships under originally assumed 7 corridors, adding
 * Peru, Chile, and Costa Rica — BlindPay has no payout rail for any of those
 * three (confirmed against `BLINDPAY_CORRIDORS` in OFFER-HUB-API's
 * `packages/shared`, which carries the same correction — see API issue #213).
 * This lists only the four real ones, one entry per rail: Brazil alone has
 * three (Pix, Pix Safe, TED).
 */
export const SUPPORTED_CORRIDORS: SupportedCorridor[] = [
  { country: "BR", code: "BRL", rail: "PIX", label: "Brazil — Pix" },
  { country: "BR", code: "BRL", rail: "PIX_SAFE", label: "Brazil — Pix (Safe)" },
  { country: "BR", code: "BRL", rail: "TED", label: "Brazil — TED" },
  { country: "MX", code: "MXN", rail: "SPEI_BITSO", label: "Mexico — SPEI" },
  { country: "AR", code: "ARS", rail: "TRANSFERS_BITSO", label: "Argentina — Transfers 3.0" },
  { country: "CO", code: "COP", rail: "ACH_COP_BITSO", label: "Colombia — ACH" },
];

/**
 * Rail-specific `details` keys the form must collect, one entry per rail in
 * {@link SUPPORTED_CORRIDORS}. Mirrors `BLINDPAY_RAIL_REQUIRED_DETAILS` in
 * OFFER-HUB-API — the account is rejected at creation if any are missing.
 */
export const SUPPORTED_CORRIDORS_REQUIRED_DETAILS: Record<string, readonly string[]> = {
  PIX: ["pix_key"],
  PIX_SAFE: ["account_type", "pix_safe_bank_code", "pix_safe_branch_code", "pix_safe_cpf_cnpj"],
  TED: ["account_type", "ted_bank_code", "ted_branch_code", "ted_cpf_cnpj"],
  SPEI_BITSO: ["spei_protocol"],
  TRANSFERS_BITSO: ["transfers_type"],
  // Confirmed against BlindPay's own OpenAPI spec — a Colombian account
  // needs the beneficiary's split name, ID document, email, and the bank's
  // routing code, not just the generic name/account number fields.
  ACH_COP_BITSO: [
    "account_type",
    "ach_cop_beneficiary_first_name",
    "ach_cop_beneficiary_last_name",
    "ach_cop_document_type",
    "ach_cop_document_id",
    "ach_cop_email",
    "ach_cop_bank_code",
  ],
};

export type BankAccountApiError = Error & { code?: string; status?: number };

function createBankAccountError(message: string, code?: string, status?: number): BankAccountApiError {
  const error = new Error(message) as BankAccountApiError;
  error.code = code;
  error.status = status;
  return error;
}

function authHeaders(token: string): HeadersInit {
  return {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  };
}

interface ErrorEnvelope {
  error?: { code?: string; message?: string };
}

async function parseBankAccountError(response: Response, fallback: string): Promise<BankAccountApiError> {
  const json = (await response.json().catch(() => null)) as ErrorEnvelope | null;
  return createBankAccountError(json?.error?.message ?? fallback, json?.error?.code, response.status);
}

/**
 * Lists the caller's bank accounts, default first.
 * GET /users/me/bank-accounts
 */
export async function listBankAccounts(token: string): Promise<BankAccount[]> {
  const response = await fetch(`${API_URL}/users/me/bank-accounts`, {
    headers: authHeaders(token),
  });

  if (!response.ok) {
    throw await parseBankAccountError(response, "Failed to load bank accounts");
  }

  const json = await response.json();
  return json.data;
}

/**
 * Registers a bank account. The first one a user adds becomes their default
 * regardless of `isDefault` — enforced server-side, not here.
 * POST /users/me/bank-accounts
 */
export async function addBankAccount(token: string, data: AddBankAccountData): Promise<BankAccount> {
  const response = await fetch(`${API_URL}/users/me/bank-accounts`, {
    method: "POST",
    headers: authHeaders(token),
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    throw await parseBankAccountError(response, "Failed to add bank account");
  }

  const json = await response.json();
  return json.data;
}

/**
 * Makes one account the caller's default for payouts.
 * PATCH /users/me/bank-accounts/:id/default
 */
export async function setDefaultBankAccount(token: string, id: string): Promise<BankAccount> {
  const response = await fetch(`${API_URL}/users/me/bank-accounts/${id}/default`, {
    method: "PATCH",
    headers: authHeaders(token),
  });

  if (!response.ok) {
    throw await parseBankAccountError(response, "Failed to set default bank account");
  }

  const json = await response.json();
  return json.data;
}

/**
 * Deletes an account. The API answers 204 No Content on success and 409 if
 * any payout still references it.
 * DELETE /users/me/bank-accounts/:id
 */
export async function deleteBankAccount(token: string, id: string): Promise<void> {
  const response = await fetch(`${API_URL}/users/me/bank-accounts/${id}`, {
    method: "DELETE",
    headers: authHeaders(token),
  });

  if (!response.ok) {
    throw await parseBankAccountError(response, "Failed to delete bank account");
  }
}
