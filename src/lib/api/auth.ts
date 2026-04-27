import { API_URL } from "@/config/api";

export interface ChangePasswordPayload {
  currentPassword: string;
  newPassword: string;
  signOutOtherSessions?: boolean;
}

type AuthApiError = Error & { status?: number };

function createAuthError(message: string, status?: number): AuthApiError {
  const error = new Error(message) as AuthApiError;
  error.status = status;
  return error;
}

export async function changePassword(
  token: string,
  payload: ChangePasswordPayload
): Promise<{ message: string }> {
  const response = await fetch(`${API_URL}/auth/change-password`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    let message = "Failed to change password";

    try {
      const error = await response.json();
      message = error.error?.message || error.message || message;
    } catch {
      // Ignore non-JSON errors
    }

    throw createAuthError(message, response.status);
  }

  const result = await response.json();
  return result.data || result;
}

/**
 * Resend the email verification link to the authenticated user.
 */
export async function sendVerification(token: string): Promise<{ message: string }> {
  const response = await fetch(`${API_URL}/auth/verify-email/resend`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error?.message || "Failed to resend verification email");
  }

  const result = await response.json();
  return result.data || result;
}

/**
 * Verify the user's email using a token.
 */
export async function verifyEmail(verificationToken: string): Promise<{ message: string }> {
  const response = await fetch(`${API_URL}/auth/verify-email`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ token: verificationToken }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error?.message || "Verification failed or token expired");
  }

  const result = await response.json();
  return result.data || result;
}
