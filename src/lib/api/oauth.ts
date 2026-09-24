import { API_URL } from "@/config/api";

export type OAuthProvider = "GITHUB" | "GOOGLE";

export interface OAuthCallbackData {
  provider: OAuthProvider;
  providerAccountId: string;
  email: string;
  name?: string;
  avatarUrl?: string;
  /**
   * Provider-issued proof of ownership. The backend re-checks it against
   * Google/GitHub before issuing a session token — without one the request is
   * just an unverified claim and is rejected.
   */
  accessToken?: string;
  idToken?: string;
}

export interface LinkedAccount {
  id: string;
  provider: OAuthProvider;
  email: string | null;
  name: string | null;
  avatarUrl: string | null;
  createdAt: string;
}

export interface OAuthCallbackResult {
  action: "LOGIN" | "REGISTER";
  user: {
    id: string;
    email: string;
    username: string;
    firstName: string | null;
    lastName: string | null;
    type: string;
    balance: { available: string; reserved: string } | null;
    wallet: { id: string; publicKey: string; type: string } | null;
  };
  token: string;
}

/** Error carrying the backend's machine-readable code so callers can branch on it. */
export class OAuthCallbackError extends Error {
  constructor(message: string, readonly code?: string) {
    super(message);
    this.name = "OAuthCallbackError";
  }
}

/**
 * Handle OAuth callback - login or register via OAuth provider
 */
export async function oauthCallback(data: OAuthCallbackData): Promise<OAuthCallbackResult> {
  const response = await fetch(`${API_URL}/auth/oauth/callback`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    // Extract error message from various possible formats
    const message = errorData.error?.message || errorData.message || "OAuth callback failed";
    throw new OAuthCallbackError(message, errorData.error?.code);
  }

  const result = await response.json();
  return result.data;
}

/**
 * Link OAuth account to authenticated user
 */
export async function linkAccount(token: string, data: OAuthCallbackData): Promise<LinkedAccount> {
  const response = await fetch(`${API_URL}/auth/oauth/link`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error?.message || "Failed to link account");
  }

  const result = await response.json();
  return result.data;
}

/**
 * Unlink OAuth account from user
 */
export async function unlinkAccount(token: string, provider: OAuthProvider): Promise<void> {
  const response = await fetch(`${API_URL}/auth/oauth/link/${provider}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error?.message || "Failed to unlink account");
  }
}

/**
 * Get all linked accounts for authenticated user
 */
export async function getLinkedAccounts(token: string): Promise<LinkedAccount[]> {
  const response = await fetch(`${API_URL}/auth/oauth/linked-accounts`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error("Failed to fetch linked accounts");
  }

  const result = await response.json();
  return result.data;
}

/**
 * Check if email exists in the system
 */
export async function checkEmailExists(email: string): Promise<{ exists: boolean; hasPassword: boolean }> {
  const response = await fetch(`${API_URL}/auth/oauth/check-email?email=${encodeURIComponent(email)}`);

  if (!response.ok) {
    throw new Error("Failed to check email");
  }

  const result = await response.json();
  return result.data;
}
