/**
 * Refresh helper
 *
 * Exchanges the long-lived backend refresh token for a new (access token,
 * refresh token) pair by hitting the real backend `/auth/refresh` endpoint.
 *
 * This is consumed by `src/services/http-client.ts` to implement the
 * "401 → attempt refresh → retry once → redirect to login on failure" flow
 * described in issue #209 ("Connect NextAuth session with backend JWT for
 * authenticated API calls").
 *
 * Implementation notes:
 * - We hit the backend directly (not the legacy Next.js BFF route at
 *   `/api/auth/refresh`) because tokens live in `localStorage` (chosen to
 *   avoid the 4 KB cookie limit and inconsistent cookie handling).
 * - Concurrent 401s share a single in-flight refresh via `inFlightRefresh`
 *   so we do not flood the backend with N parallel refresh calls when
 *   several requests fail at once.
 */

import { API_URL } from "@/config/api";
import { useAuthStore } from "@/stores/auth-store";

export interface RefreshSuccess {
  token: string;
  refreshToken: string;
}

export type RefreshResult = RefreshSuccess | null;

let inFlightRefresh: Promise<RefreshResult> | null = null;

/**
 * Clear the cached in-flight refresh promise. Tracked at module scope so
 * concurrent 401s share a single refresh request per page-load.
 */
function resetRefreshState(): void {
  inFlightRefresh = null;
}

async function performRefresh(): Promise<RefreshResult> {
  const { refreshToken, logout, setAuthTokens } = useAuthStore.getState();

  if (!refreshToken) {
    // No refresh token means we can never recover — log the user out so the
    // UI redirects them to /login on the next render.
    await logout();
    return null;
  }

  try {
    const response = await fetch(`${API_URL}/auth/refresh`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refreshToken }),
    });

    // Only treat a refresh token REJECTION as a hard logout. Transient
    // failures (5xx, 429, parse errors, network) return null without
    // logging out — we do not want a flaky backend to permanently sign a
    // legitimate user out.
    if (response.status === 401 || response.status === 403) {
      await logout();
      return null;
    }

    if (!response.ok) {
      return null;
    }

    const payload: unknown = await response.json();
    const token = extractToken(payload);

    if (!token) {
      // Reject the session only when the backend explicitly refused the
      // refresh token; anything else we just propagate as null and let the
      // caller decide (typically the user retries).
      const rejected =
        payload &&
        typeof payload === "object" &&
        ((payload as Record<string, unknown>).code === 4010 ||
          (payload as Record<string, unknown>).code === 401);
      if (rejected) {
        await logout();
      }
      return null;
    }

    const nextRefreshToken = extractRefreshToken(payload) ?? refreshToken;
    setAuthTokens(token, nextRefreshToken);
    return { token, refreshToken: nextRefreshToken };
  } catch {
    // Network error — do NOT log out automatically (transient failures should
    // not kick the user out). The caller decides what to surface.
    return null;
  }
}

function extractToken(payload: unknown): string | null {
  if (!payload || typeof payload !== "object") return null;
  const obj = payload as Record<string, unknown>;

  const candidates: unknown[] = [
    obj.token,
    (obj.data as Record<string, unknown> | undefined)?.token,
  ];

  for (const candidate of candidates) {
    if (typeof candidate === "string" && candidate.length > 0) {
      return candidate;
    }
  }
  return null;
}

function extractRefreshToken(payload: unknown): string | null {
  if (!payload || typeof payload !== "object") return null;
  const obj = payload as Record<string, unknown>;

  const candidates: unknown[] = [
    obj.refreshToken,
    (obj.data as Record<string, unknown> | undefined)?.refreshToken,
  ];

  for (const candidate of candidates) {
    if (typeof candidate === "string" && candidate.length > 0) {
      return candidate;
    }
  }
  return null;
}

/**
 * Exchange the stored refresh token for a new access token.
 *
 * Concurrent callers always resolve to the same promise so we never fire
 * more than one refresh request at the same time.
 */
export function refreshAccessToken(): Promise<RefreshResult> {
  if (inFlightRefresh) {
    return inFlightRefresh;
  }

  inFlightRefresh = performRefresh().finally(() => {
    inFlightRefresh = null;
  });

  return inFlightRefresh;
}
