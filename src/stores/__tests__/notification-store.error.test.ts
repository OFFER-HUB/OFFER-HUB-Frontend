import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/lib/api/notifications", () => ({
  getNotifications: vi.fn(),
  markNotificationsRead: vi.fn(),
  markAllNotificationsRead: vi.fn(),
}));

import { getNotifications } from "@/lib/api/notifications";
import { useNotificationStore } from "../notification-store";

const mockedGet = vi.mocked(getNotifications);

beforeEach(() => {
  useNotificationStore.setState({ notifications: [], unreadCount: 0, error: null, isLoading: false });
  mockedGet.mockReset();
});

describe("notification store errors", () => {
  it("sets an error instead of looking empty when the request fails", async () => {
    mockedGet.mockResolvedValue({ ok: false, data: null } as never);

    await useNotificationStore.getState().fetchNotifications();

    expect(useNotificationStore.getState().error).toBe("We couldn't load your notifications.");
    expect(useNotificationStore.getState().notifications).toEqual([]);
  });

  it("clears the error after a successful retry", async () => {
    mockedGet.mockResolvedValueOnce({ ok: false, data: null } as never);
    await useNotificationStore.getState().fetchNotifications();

    mockedGet.mockResolvedValueOnce({
      ok: true,
      data: { notifications: [], unreadCount: 0, hasMore: false },
    } as never);
    await useNotificationStore.getState().fetchNotifications();

    expect(useNotificationStore.getState().error).toBeNull();
  });
});
