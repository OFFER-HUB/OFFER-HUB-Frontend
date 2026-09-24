import { API_URL } from "@/config/api";

const API_BASE_URL = API_URL;

export interface ForgotPasswordResponse {
  message: string;
}

export interface ValidateResetTokenResponse {
  valid: boolean;
  email: string;
}

export interface ResetPasswordResponse {
  message: string;
}

/**
 * Request a password reset email for the given address.
 * Always resolves successfully to avoid leaking whether an email exists.
 */
export async function forgotPassword(email: string): Promise<ForgotPasswordResponse> {
  const response = await fetch(`${API_BASE_URL}/auth/password-reset/request`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error?.message || error.message || "Failed to send password reset email");
  }

  const result = await response.json();
  return result.data;
}

/**
 * Validate a password reset token before showing the reset form.
 * Returns whether the token is valid and the associated email.
 */
export async function validateResetToken(token: string): Promise<ValidateResetTokenResponse> {
  const response = await fetch(`${API_BASE_URL}/auth/password-reset/validate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ token }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error?.message || error.message || "Invalid or expired reset token");
  }

  const result = await response.json();
  return result.data;
}

/**
 * Reset the user's password using a valid reset token.
 */
export async function resetPassword(token: string, newPassword: string): Promise<ResetPasswordResponse> {
  const response = await fetch(`${API_BASE_URL}/auth/password-reset/confirm`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ token, newPassword }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error?.message || error.message || "Failed to reset password");
  }

  const result = await response.json();
  return result.data;
}
