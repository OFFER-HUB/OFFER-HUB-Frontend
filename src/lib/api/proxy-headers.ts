/** Header the API reads the visitor's IP from (see the API's client-ip.ts). */
export const CLIENT_IP_HEADER = "X-OfferHub-Client-IP";
/** Proves to the API that the visitor IP came from this server. */
export const PROXY_SECRET_HEADER = "X-OfferHub-Proxy-Secret";

interface HeaderSource {
  headers: Headers;
}

/**
 * The visitor's IP as Vercel's edge reports it. Vercel sets `x-real-ip` and
 * overwrites `x-forwarded-for`, so a visitor can't put their own value there.
 */
export function clientIpFrom(request: HeaderSource): string | null {
  const realIp = request.headers.get("x-real-ip")?.trim();
  if (realIp) return realIp;
  const forwarded = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  return forwarded || null;
}

/**
 * Headers that let the API rate-limit the visitor instead of this server.
 *
 * Our routes call the API from a Vercel function, so without these every
 * visitor shares the function's IP and one rate-limit bucket. Sent only when
 * `API_PROXY_SECRET` is set; the API ignores the IP unless the secret matches
 * its `FRONTEND_PROXY_SECRET`.
 */
export function visitorHeaders(request: HeaderSource): Record<string, string> {
  const secret = process.env.API_PROXY_SECRET;
  const ip = clientIpFrom(request);
  if (!secret || !ip) return {};
  return { [CLIENT_IP_HEADER]: ip, [PROXY_SECRET_HEADER]: secret };
}
