interface TokenResponse {
  success: boolean;
  error?: string;
}

interface AuthStatus {
  authenticated: boolean;
  hasRefreshToken: boolean;
}

const DEFAULT_AUTH_STATUS: AuthStatus = { authenticated: false, hasRefreshToken: false };

function getErrorMessage(error: unknown, fallback: string): string {
  return error instanceof Error ? error.message : fallback;
}

async function authFetch(
  url: string,
  options: RequestInit
): Promise<{ ok: boolean; data?: Record<string, unknown> }> {
  try {
    const response = await fetch(url, { ...options, credentials: "include" });
    const data = response.ok || response.headers.get("content-type")?.includes("json")
      ? await response.json()
      : undefined;
    return { ok: response.ok, data };
  } catch {
    return { ok: false };
  }
}

export async function setAuthTokens(
  token: string,
  refreshToken?: string
): Promise<TokenResponse> {
  try {
    const response = await fetch("/api/auth/token", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token, refreshToken }),
    });

    if (!response.ok) {
      const data = await response.json();
      return { success: false, error: data.error };
    }

    return { success: true };
  } catch (error) {
    return { success: false, error: getErrorMessage(error, "Failed to store tokens") };
  }
}

export async function checkAuthStatus(): Promise<AuthStatus> {
  const { ok, data } = await authFetch("/api/auth/token", { method: "GET" });
  if (ok && data && typeof data.authenticated === "boolean") {
    return data as unknown as AuthStatus;
  }
  return DEFAULT_AUTH_STATUS;
}

export async function clearAuthTokens(): Promise<TokenResponse> {
  const { ok, data } = await authFetch("/api/auth/token", { method: "DELETE" });

  if (!ok) {
    return { success: false, error: data?.error as string | undefined };
  }

  return { success: true };
}

export async function refreshAuthToken(): Promise<TokenResponse> {
  const { ok, data } = await authFetch("/api/auth/refresh", { method: "POST" });

  if (!ok) {
    return { success: false, error: data?.error as string | undefined };
  }

  return { success: true };
}

export function setupTokenRefresh(intervalMinutes: number = 10): () => void {
  const intervalMs = intervalMinutes * 60 * 1000;

  const intervalId = setInterval(async () => {
    const status = await checkAuthStatus();

    if (status.authenticated && status.hasRefreshToken) {
      await refreshAuthToken();
    }
  }, intervalMs);

  return () => clearInterval(intervalId);
}
