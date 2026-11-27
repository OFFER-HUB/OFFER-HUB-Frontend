import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook } from "@testing-library/react";

vi.mock("@/lib/api/orders", () => ({ getOrderAttachmentUrl: vi.fn() }));

import { getOrderAttachmentUrl } from "@/lib/api/orders";
import { useOrderAttachmentUrl } from "../useOrderAttachmentUrl";
import type { OrderAttachment } from "@/types/order.types";

const file: OrderAttachment = {
  id: "att_1",
  name: "kit.zip",
  size: 10,
  mimeType: "application/zip",
  uploadedBy: "usr_s",
  uploaderRole: "seller",
  createdAt: "2026-11-26T10:00:00.000Z",
};
const mocked = getOrderAttachmentUrl as unknown as ReturnType<typeof vi.fn>;

describe("useOrderAttachmentUrl", () => {
  beforeEach(() => {
    vi.useFakeTimers().setSystemTime(new Date("2026-11-26T10:00:00.000Z"));
    mocked.mockReset();
  });
  afterEach(() => vi.useRealTimers());

  it("uses the legacy public url without calling the API", async () => {
    const { result } = renderHook(() => useOrderAttachmentUrl("tok", "ord_1"));

    await expect(result.current.resolveUrl({ ...file, url: "https://public" })).resolves.toBe("https://public");
    expect(mocked).not.toHaveBeenCalled();
  });

  it("caches a signed URL until shortly before it expires", async () => {
    mocked
      .mockResolvedValueOnce({ url: "https://signed-1", expiresAt: "2026-11-26T10:10:00.000Z" })
      .mockResolvedValueOnce({ url: "https://signed-2", expiresAt: "2026-11-26T10:20:00.000Z" });
    const { result } = renderHook(() => useOrderAttachmentUrl("tok", "ord_1"));

    await expect(result.current.resolveUrl(file)).resolves.toBe("https://signed-1");
    await expect(result.current.resolveUrl(file)).resolves.toBe("https://signed-1");
    expect(mocked).toHaveBeenCalledTimes(1);

    vi.setSystemTime(new Date("2026-11-26T10:09:45.000Z"));
    await expect(result.current.resolveUrl(file)).resolves.toBe("https://signed-2");
  });

  it("fetches a new URL when asked for a fresh one", async () => {
    mocked.mockResolvedValue({ url: "https://signed", expiresAt: "2026-11-26T10:10:00.000Z" });
    const { result } = renderHook(() => useOrderAttachmentUrl("tok", "ord_1"));

    await result.current.resolveUrl(file);
    await result.current.resolveUrl(file, { fresh: true });

    expect(mocked).toHaveBeenCalledTimes(2);
  });
});
