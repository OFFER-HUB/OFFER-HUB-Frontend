import type { SessionTokenPayload } from "@/types/auth.types";

/**
 * Decodes the payload segment of a JWT without verifying its signature.
 *
 * This is only for reading claims the UI needs (e.g. `isAdmin`) — the backend is
 * what actually enforces them, so a tampered token still gets a 401/403 on every
 * `/admin/*` call. Returns `null` for anything that is not a well-formed JWT.
 */
export function decodeSessionToken(token: string): SessionTokenPayload | null {
  const segments = token.split(".");
  if (segments.length !== 3) return null;

  try {
    // JWTs use base64url; atob() only understands standard base64.
    const base64 = segments[1].replace(/-/g, "+").replace(/_/g, "/");
    const padded = base64.padEnd(base64.length + ((4 - (base64.length % 4)) % 4), "=");
    const parsed: unknown = JSON.parse(atob(padded));

    if (typeof parsed !== "object" || parsed === null || typeof (parsed as { sub?: unknown }).sub !== "string") {
      return null;
    }
    return parsed as SessionTokenPayload;
  } catch {
    return null;
  }
}

/** True only when the token explicitly carries `isAdmin: true`. */
export function hasAdminClaim(token: string | null): boolean {
  if (!token) return false;
  return decodeSessionToken(token)?.isAdmin === true;
}
