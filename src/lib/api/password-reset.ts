import { API_URL } from "@/config/api";

export interface ResetPasswordResponse {
  message: string;
}

export type ResetPasswordErrorKind = "invalid-token" | "validation" | "unavailable";

/**
 * Error thrown by {@link resetPassword}. `kind` lets the UI tell a dead
 * reset link apart from a validation problem or a server/network failure.
 */
export class ResetPasswordError extends Error {
  readonly kind: ResetPasswordErrorKind;

  constructor(kind: ResetPasswordErrorKind, message: string) {
    super(message);
    this.name = "ResetPasswordError";
    this.kind = kind;
  }
}

const GENERIC_ERROR = "Something went wrong while resetting your password. Please try again.";

async function readMessage(response: Response): Promise<string | undefined> {
  try {
    const body = (await response.json()) as {
      message?: string | string[];
      error?: { message?: string };
    };
    const message = body.error?.message ?? body.message;
    return Array.isArray(message) ? message.join(" ") : message;
  } catch {
    return undefined;
  }
}

/**
 * Reset the user's password using the token from the reset email.
 *
 * The API has no "validate token" route: the token is checked when the new
 * password is submitted, so a dead link is only detected here.
 */
export async function resetPassword(token: string, newPassword: string): Promise<ResetPasswordResponse> {
  let response: Response;

  try {
    response = await fetch(`${API_URL}/auth/reset-password`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token, newPassword }),
    });
  } catch {
    throw new ResetPasswordError("unavailable", GENERIC_ERROR);
  }

  if (!response.ok) {
    const message = await readMessage(response);

    if (response.status === 400 && message && /invalid|expired|used/i.test(message)) {
      throw new ResetPasswordError("invalid-token", message);
    }

    if (response.status >= 400 && response.status < 500 && response.status !== 404 && message) {
      throw new ResetPasswordError("validation", message);
    }

    throw new ResetPasswordError("unavailable", GENERIC_ERROR);
  }

  const result = (await response.json()) as { data: ResetPasswordResponse };
  return result.data;
}
