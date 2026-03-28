import { API_URL } from "@/config/api";
import { getMockProfileViewsAnalytics } from "@/data/profile-views.data";
import type { ApiResponse } from "@/types/api-response.types";
import type { ProfileViewsAnalytics } from "@/types/profile-views.types";

const API_BASE_URL = API_URL;

/**
 * Fetch profile views analytics for the authenticated freelancer.
 *
 * Falls back to mock data when the endpoint is unavailable so the dashboard
 * remains reviewable during frontend development.
 */
export async function getProfileViewsAnalytics(token: string): Promise<ProfileViewsAnalytics> {
  try {
    const response = await fetch(`${API_BASE_URL}/freelancer/analytics/profile-views`, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error("Failed to fetch profile views analytics");
    }

    const result = (await response.json()) as ApiResponse<ProfileViewsAnalytics>;

    if (!result.data) {
      throw new Error("Profile views analytics response was empty");
    }

    return result.data;
  } catch {
    return getMockProfileViewsAnalytics();
  }
}
