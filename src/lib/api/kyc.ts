import { API_URL } from "@/config/api";

export type KycIdDocType = "PASSPORT" | "ID_CARD" | "DRIVERS";
export type KycTier = "STANDARD" | "ENHANCED";
export type ProofOfAddressDocType =
  | "UTILITY_BILL"
  | "BANK_STATEMENT"
  | "RENTAL_AGREEMENT"
  | "TAX_DOCUMENT"
  | "GOVERNMENT_CORRESPONDENCE";

/**
 * BlindPay requires these lowercase, unlike every other KYC enum — confirmed
 * against a live instance while building API issue #249. Do not uppercase them.
 */
export type SourceOfFundsDocType =
  | "business_income"
  | "gambling_proceeds"
  | "gifts"
  | "government_benefits"
  | "inheritance"
  | "investment_loans"
  | "pension_retirement"
  | "salary"
  | "sale_of_assets_real_estate"
  | "savings"
  | "esops"
  | "investment_proceeds"
  | "someone_else_funds";

export type PurposeOfTransactions =
  | "business_transactions"
  | "charitable_donations"
  | "investment_purposes"
  | "payments_to_friends_or_family_abroad"
  | "personal_or_living_expenses"
  | "protect_wealth"
  | "purchase_good_and_services"
  | "receive_payment_for_freelancing"
  | "receive_salary"
  | "other";

/** Countries BlindPay classifies as higher-risk, requiring ENHANCED instead of STANDARD KYC. */
const ENHANCED_KYC_COUNTRIES = new Set(["CO"]);

export function requiresEnhancedKyc(country: string): boolean {
  return ENHANCED_KYC_COUNTRIES.has(country.toUpperCase());
}

/** Mirrors the `KycProfile` Prisma model in OFFER-HUB-API. */
export interface KycProfile {
  id: string;
  userId: string;
  /** ISO 3166-1 alpha-2 — the corridor this profile was submitted for. Decides kycTier. */
  country: string;
  taxId: string;
  addressLine1: string;
  addressLine2: string | null;
  city: string;
  stateProvinceRegion: string;
  postalCode: string;
  idDocCountry: string;
  idDocType: KycIdDocType;
  selfieFileUrl: string;
  idDocFrontFileUrl: string;
  idDocBackFileUrl: string | null;
  kycTier: KycTier;
  proofOfAddressDocType: ProofOfAddressDocType | null;
  proofOfAddressDocFileUrl: string | null;
  sourceOfFundsDocType: SourceOfFundsDocType | null;
  sourceOfFundsDocFileUrl: string | null;
  purposeOfTransactions: PurposeOfTransactions | null;
  purposeOfTransactionsExplanation: string | null;
  /** Set once the user accepts BlindPay's terms of service — see acceptTos. */
  blindpayTosId: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface SubmitKycData {
  /**
   * These three live on the User record, not the KYC profile — BlindPay
   * customer creation needs them and nothing else in the app collects them,
   * so an account created before this field existed gets backfilled here.
   */
  firstName: string;
  lastName: string;
  /** ISO 8601 date, e.g. "1990-01-01". */
  dateOfBirth: string;
  /** ISO 3166-1 alpha-2 — same value a bank account's `country` uses. Decides STANDARD vs ENHANCED. */
  country: string;
  taxId: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  stateProvinceRegion: string;
  postalCode: string;
  idDocCountry: string;
  idDocType: KycIdDocType;
  selfieFileUrl: string;
  idDocFrontFileUrl: string;
  idDocBackFileUrl?: string;
  proofOfAddressDocType?: ProofOfAddressDocType;
  proofOfAddressDocFileUrl?: string;
  sourceOfFundsDocType?: SourceOfFundsDocType;
  sourceOfFundsDocFileUrl?: string;
  purposeOfTransactions?: PurposeOfTransactions;
  purposeOfTransactionsExplanation?: string;
}

export type KycApiError = Error & { code?: string; status?: number };

function createKycError(message: string, code?: string, status?: number): KycApiError {
  const error = new Error(message) as KycApiError;
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

async function parseKycError(response: Response, fallback: string): Promise<KycApiError> {
  const json = (await response.json().catch(() => null)) as ErrorEnvelope | null;
  return createKycError(json?.error?.message ?? fallback, json?.error?.code, response.status);
}

/**
 * The caller's own KYC profile, or `null` if they haven't submitted one yet —
 * that 404 is an expected first-time state, not an error to surface.
 * GET /users/me/kyc
 */
export async function getMyKyc(token: string): Promise<KycProfile | null> {
  const response = await fetch(`${API_URL}/users/me/kyc`, {
    headers: authHeaders(token),
  });

  if (response.status === 404) return null;
  if (!response.ok) {
    throw await parseKycError(response, "Failed to load your KYC profile");
  }

  const json = await response.json();
  return json.data;
}

/**
 * Submits or updates the caller's KYC profile. Safe to call again to fix a typo.
 * POST /users/me/kyc
 */
export async function submitKyc(token: string, data: SubmitKycData): Promise<KycProfile> {
  const response = await fetch(`${API_URL}/users/me/kyc`, {
    method: "POST",
    headers: authHeaders(token),
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    throw await parseKycError(response, "Failed to submit your KYC profile");
  }

  const json = await response.json();
  return json.data;
}

/**
 * Starts BlindPay's terms-of-service acceptance flow. BlindPay only accepts
 * this from the user's own browser — send them to the returned URL, don't try
 * to complete it from here. The redirect target (KYC_TOS_CALLBACK_PATH) is
 * fixed server-side to this app's own callback route.
 * POST /users/me/kyc/tos-url
 */
export async function generateTosUrl(token: string, redirectUrl?: string): Promise<string> {
  const targetRedirectUrl =
    redirectUrl ??
    (typeof window !== "undefined"
      ? `${window.location.origin}/app/kyc/tos-callback`
      : undefined);

  const response = await fetch(`${API_URL}/users/me/kyc/tos-url`, {
    method: "POST",
    headers: authHeaders(token),
    body: JSON.stringify(targetRedirectUrl ? { redirectUrl: targetRedirectUrl } : {}),
  });

  if (!response.ok) {
    throw await parseKycError(response, "Failed to start terms-of-service acceptance");
  }

  const json = await response.json();
  return json.data.url;
}

/**
 * Records the `tos_id` BlindPay appended to the callback URL after the user
 * accepted. Called automatically by the callback page — never by hand.
 * POST /users/me/kyc/tos-accept
 */
export async function acceptTos(token: string, tosId: string): Promise<KycProfile> {
  const response = await fetch(`${API_URL}/users/me/kyc/tos-accept`, {
    method: "POST",
    headers: authHeaders(token),
    body: JSON.stringify({ tosId }),
  });

  if (!response.ok) {
    throw await parseKycError(response, "Failed to confirm terms-of-service acceptance");
  }

  const json = await response.json();
  return json.data;
}
