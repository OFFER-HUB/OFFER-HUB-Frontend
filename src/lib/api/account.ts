import { API_URL } from "@/config/api";

export interface DeleteAccountPayload {
  password: string;
}

export interface DeleteAccountError {
  code: "ACTIVE_ORDERS" | "INSUFFICIENT_BALANCE" | "INVALID_PASSWORD" | "UNKNOWN";
  message: string;
}

/**
 * Permanently delete the authenticated user's account.
 * Requires the user's current password for confirmation.
 *
 * @throws {DeleteAccountError} on known validation failures
 * @throws {Error} on network or unexpected errors
 */
export async function deleteAccount(
  token: string,
  payload: DeleteAccountPayload
): Promise<void> {
  const response = await fetch(`${API_URL}/users/me`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (response.ok) return;

  // Parse structured errors from the backend
  let body: { code?: string; message?: string; error?: { message?: string } } = {};
  try {
    body = await response.json();
  } catch {
    // non-JSON body — fall through to generic error
  }

  const rawCode = body.code ?? "";
  const message =
    body.message ?? body.error?.message ?? "Failed to delete account. Please try again.";

  if (rawCode === "ACTIVE_ORDERS" || response.status === 409) {
    throw { code: "ACTIVE_ORDERS", message } satisfies DeleteAccountError;
  }

  if (rawCode === "INSUFFICIENT_BALANCE") {
    throw { code: "INSUFFICIENT_BALANCE", message } satisfies DeleteAccountError;
  }

  if (rawCode === "INVALID_PASSWORD" || response.status === 401) {
    throw { code: "INVALID_PASSWORD", message: "Incorrect password. Please try again." } satisfies DeleteAccountError;
  }

  throw { code: "UNKNOWN", message } satisfies DeleteAccountError;
}
