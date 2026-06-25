/**
 * Auth client helpers
 *
 * Legacy HTTP-only cookie helpers used by the logout flow.
 *
 * NOTE: Token refresh is intentionally NOT handled here anymore. It lives
 * in `src/lib/api/refresh.ts` and is invoked automatically by
 * `src/services/http-client.ts` on a 401 response.
 */

interface TokenResponse {
  success: boolean;
  error?: string;
}

async function authFetch(
  url: string,
  options: RequestInit
): Promise<{ ok: boolean; data?: Record<string, unknown> }> {
  try {
    const response = await fetch(url, { ...options, credentials: "include" });
    const data =
      response.ok || response.headers.get("content-type")?.includes("json")
        ? await response.json()
        : undefined;
    return { ok: response.ok, data };
  } catch {
    return { ok: false };
  }
}

/**
 * Clear any httpOnly cookies holding tokens.
 *
 * Called from the logout flow in `useAuthStore` to ensure both client-side
 * (localStorage) and server-side (cookie) state are wiped on sign-out.
 */
export async function clearAuthTokens(): Promise<TokenResponse> {
  const { ok, data } = await authFetch("/api/auth/token", { method: "DELETE" });

  if (!ok) {
    return { success: false, error: data?.error as string | undefined };
  }

  return { success: true };
}
