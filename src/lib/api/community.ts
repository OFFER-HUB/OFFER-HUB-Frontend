import { API_URL } from "@/config/api";
import type { MapUser, MapLocationsResponse } from "@/types/community-map.types";

export type { MapUser, MapLocationsResponse } from "@/types/community-map.types";

/**
 * Get all users who have opted to appear on the community map.
 * This is a public endpoint - no authentication required.
 *
 * The response includes safe public information only:
 * - id, name, avatar, userType, country, countryCode, region
 */
export async function getMapLocations(): Promise<MapLocationsResponse> {
  const response = await fetch(`${API_URL}/users/map-locations`, {
    headers: {
      "Content-Type": "application/json",
    },
    // Cache for 5 minutes on the client
    next: { revalidate: 300 },
  });

  if (!response.ok) {
    throw new Error("Failed to fetch map locations");
  }

  const data = await response.json();

  // Transform API response to match our types
  const users: MapUser[] = (data.data?.users || data.users || []).map(
    (user: Record<string, unknown>) => ({
      id: user.id as string,
      name: (user.name || user.firstName || user.username || "User") as string,
      avatar: (user.avatar || user.avatarUrl || null) as string | null,
      userType: (user.userType || user.type || "FREELANCER") as "FREELANCER" | "CLIENT",
      country: (user.country || "") as string,
      countryCode: (user.countryCode || "") as string,
      region: (user.region || null) as string | null,
      latitude: (user.latitude || 0) as number,
      longitude: (user.longitude || 0) as number,
    })
  );

  return {
    users,
    total: data.data?.total || data.total || users.length,
  };
}
