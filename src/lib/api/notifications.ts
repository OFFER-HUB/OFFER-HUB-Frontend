import { httpGet, httpPatch } from "@/services/http-client";
import type {
  NotificationsResponse,
  MarkReadPayload,
} from "@/types/notification.types";
import type { ApiResponse } from "@/types/api-response.types";

const BASE = "/notifications";

/**
 * Fetch paginated notifications for the current user.
 * @param cursor - optional pagination cursor for infinite scroll
 */
export async function getNotifications(
  cursor?: string
): Promise<ApiResponse<NotificationsResponse>> {
  return httpGet<NotificationsResponse>(BASE, {
    params: cursor ? { cursor, limit: "15" } : { limit: "15" },
  });
}

/**
 * Mark one or more notifications as read.
 */
export async function markNotificationsRead(
  notificationIds: string[]
): Promise<ApiResponse<null>> {
  const payload: MarkReadPayload = { notificationIds };
  return httpPatch<null>(`${BASE}/read`, payload);
}

/**
 * Mark every notification as read in one shot.
 */
export async function markAllNotificationsRead(): Promise<ApiResponse<null>> {
  return httpPatch<null>(`${BASE}/read-all`);
}