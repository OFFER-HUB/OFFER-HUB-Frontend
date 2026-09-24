import { API_URL } from "@/config/api";
import type { ApiResponse } from "@/types/api-response.types";
import type { UserPreferences } from "@/types/preferences.types";

const PREFERENCES_ENDPOINT = `${API_URL}/users/preferences`;

/**
 * Fetch the authenticated user's saved display preferences.
 */
export async function getPreferences(token: string): Promise<UserPreferences> {
  const response = await fetch(PREFERENCES_ENDPOINT, {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    throw new Error("Failed to fetch preferences");
  }

  const result = (await response.json()) as ApiResponse<UserPreferences>;

  if (!result.data) {
    throw new Error("Preferences response was empty");
  }

  return result.data;
}

/**
 * Persist the authenticated user's display preferences.
 */
export async function updatePreferences(
  token: string,
  preferences: UserPreferences
): Promise<UserPreferences> {
  const response = await fetch(PREFERENCES_ENDPOINT, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(preferences),
  });

  if (!response.ok) {
    throw new Error("Failed to save preferences");
  }

  const result = (await response.json()) as ApiResponse<UserPreferences>;

  if (!result.data) {
    throw new Error("Preferences response was empty");
  }

  return result.data;
}
