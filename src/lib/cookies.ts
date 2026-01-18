export const COOKIE_CONFIG = {
  AUTH_STATE: "auth-state",
  AUTH_TOKEN: "auth-token",
  REFRESH_TOKEN: "refresh-token",
  EXPIRY_DAYS: 7,
  REFRESH_EXPIRY_DAYS: 30,
} as const;

const DAYS_TO_SECONDS = 24 * 60 * 60;

function isProduction(): boolean {
  return process.env.NODE_ENV === "production";
}

function buildCookieOptions(maxAgeSeconds: number, includeHttpOnly: boolean = true): string[] {
  const options = [
    `Max-Age=${maxAgeSeconds}`,
    "Path=/",
    "SameSite=Lax",
  ];

  if (includeHttpOnly) {
    options.push("HttpOnly");
  }

  if (isProduction()) {
    options.push("Secure");
  }

  return options;
}

export function buildSecureCookie(
  name: string,
  value: string,
  maxAgeDays: number = COOKIE_CONFIG.EXPIRY_DAYS
): string {
  const maxAgeSeconds = maxAgeDays * DAYS_TO_SECONDS;
  const options = buildCookieOptions(maxAgeSeconds);
  return `${name}=${encodeURIComponent(value)}; ${options.join("; ")}`;
}

export function buildDeleteCookie(name: string): string {
  const options = buildCookieOptions(0);
  return `${name}=; ${options.join("; ")}`;
}

export function parseCookies(cookieHeader: string | null): Record<string, string> {
  if (!cookieHeader) return {};

  return cookieHeader.split(";").reduce(
    (cookies, cookie) => {
      const [name, ...valueParts] = cookie.trim().split("=");
      if (name) {
        cookies[name] = decodeURIComponent(valueParts.join("="));
      }
      return cookies;
    },
    {} as Record<string, string>
  );
}

export const clientCookies = {
  get(name: string): string | null {
    if (typeof document === "undefined") return null;
    const match = document.cookie.match(new RegExp(`(^| )${name}=([^;]+)`));
    return match ? decodeURIComponent(match[2]) : null;
  },

  set(name: string, value: string, days: number = COOKIE_CONFIG.EXPIRY_DAYS): void {
    if (typeof document === "undefined") return;
    const expires = new Date(Date.now() + days * 864e5).toUTCString();
    document.cookie = `${name}=${encodeURIComponent(value)}; expires=${expires}; path=/; SameSite=Lax`;
  },

  remove(name: string): void {
    if (typeof document === "undefined") return;
    document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/`;
  },
};
