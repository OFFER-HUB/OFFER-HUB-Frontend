import { API_URL } from "@/config/api";
import type { ApiResponse } from "@/types/api-response.types";
import type { NotificationPreferences } from "@/types/notification-preferences.types";

const NOTIFICATION_PREFERENCES_ENDPOINT = `${API_URL}/users/notification-preferences`;

/**
 * Fetch the authenticated user's notification preference matrix.
 */
export async function getNotificationPreferences(token: string): Promise<NotificationPreferences> {
  const response = await fetch(NOTIFICATION_PREFERENCES_ENDPOINT, {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    throw new Error("Failed to fetch notification preferences");
  }

  const result = (await response.json()) as ApiResponse<NotificationPreferences>;

  if (!result.data) {
    throw new Error("Notification preferences response was empty");
  }

  return result.data;
}

/**
 * Persist the authenticated user's notification preference matrix.
 */
export async function updateNotificationPreferences(
  token: string,
  preferences: NotificationPreferences
): Promise<NotificationPreferences> {
  const response = await fetch(NOTIFICATION_PREFERENCES_ENDPOINT, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(preferences),
  });

  if (!response.ok) {
    throw new Error("Failed to save notification preferences");
  }

  const result = (await response.json()) as ApiResponse<NotificationPreferences>;

  if (!result.data) {
    throw new Error("Notification preferences response was empty");
  }

  return result.data;
}
