import { useCallback, useRef } from "react";
import { getOrderAttachmentUrl } from "@/lib/api/orders";
import type { OrderAttachment } from "@/types/order.types";

/** Drop a cached link this long before it expires, so it never dies mid-click. */
const EXPIRY_MARGIN_MS = 30_000;

/**
 * Resolves a usable URL for an order file. Files from API versions before
 * private storage still carry a public `url`; newer ones get a short-lived
 * signed URL that is cached in memory until just before it expires.
 */
export function useOrderAttachmentUrl(
  token: string | null | undefined,
  orderId: string
): {
  resolveUrl: (file: OrderAttachment, options?: { fresh?: boolean }) => Promise<string>;
} {
  const cache = useRef(new Map<string, { url: string; expiresAt: number }>());

  const resolveUrl = useCallback(
    async (file: OrderAttachment, options: { fresh?: boolean } = {}): Promise<string> => {
      if (file.url) return file.url;
      if (!token) throw new Error("Sign in again to open this file");

      const cached = cache.current.get(file.id);
      if (!options.fresh && cached && cached.expiresAt - EXPIRY_MARGIN_MS > Date.now()) {
        return cached.url;
      }

      const { url, expiresAt } = await getOrderAttachmentUrl(token, orderId, file.id);
      cache.current.set(file.id, { url, expiresAt: new Date(expiresAt).getTime() });
      return url;
    },
    [token, orderId]
  );

  return { resolveUrl };
}
